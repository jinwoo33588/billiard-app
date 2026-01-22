/**
 * backend/services/auth.service.js
 *
 * [ROLE]
 * - 인증(Auth) 관련 "비즈니스 로직"을 담당하는 서비스 레이어.
 * - 회원가입(register) / 로그인(login)의 핵심 규칙을 한 곳에 모아 둔다.
 *
 * [BOUNDARY / WHAT NOT TO DO HERE]
 * - 이 파일은 Express의 req/res를 다루지 않는다. (HTTP status, res.json 등은 Controller 책임)
 * - 입력값의 형식 검증(필수값/숫자/범위/정규화)은 Validator에서 수행한다.
 * - 토큰 검증(Authorization 헤더 파싱/verify)은 Middleware에서 수행한다.
 *
 * [KEY RESPONSIBILITIES]
 * - 중복 체크(이메일/닉네임): DB 조회 기반의 업무 규칙 → 409 Conflict
 * - 비밀번호 처리: bcrypt로 해시 저장, 로그인 시 compare로 검증
 * - JWT 발급: userId를 payload로 토큰 생성
 *
 * [EXPORTS]
 * - register({ email, password, nickname, handicap }) -> { token, user }
 * - login({ email, password }) -> { token, user }
 *
 * [DEPENDENCIES]
 * - Model: User (MongoDB)
 * - Lib: bcrypt, jsonwebtoken
 * - Env: JWT_SECRET_KEY
 * - Error: HttpError (에러 미들웨어에서 status/message 통일 처리)
 */


const bcrypt = require("bcrypt");                                   // bcrypt: 비밀번호를 안전하게 "해시"하기 위한 라이브러리
const jwt = require("jsonwebtoken");                                // jsonwebtoken: JWT 토큰을 발급/검증하는 라이브러리 (검증은 auth.middleware가 담당)
const User = require("../models/User");                             // User 모델: MongoDB(users 컬렉션)와 연결된 Mongoose 모델 (findOne, create 같은 DB 작업을 함수처럼 호출 가능)
const { HttpError } = require("../utils/httpError");                // HttpError: status 코드를 가진 커스텀 에러

/**
 * ✅ 토큰 발급 함수
 * - 입력: userId (문자열)
 * - 출력: JWT 문자열
 *
 * 왜 분리?
 * - register/login 둘 다 토큰이 필요하므로 중복 제거
 */
function signToken(userId) {
  const secret = process.env.JWT_SECRET_KEY;                        // process.env.JWT_SECRET_KEY는 dotenv가 index.js에서 읽어서 세팅해 둔 값 (Node 프로세스 전체에서 공유되므로 여기서도 접근 가능)
  if (!secret) throw new Error("JWT_SECRET_KEY is missing");        // secret이 없으면 토큰 발급이 불가능 -> 서버 설정 문제

  /**
   * jwt.sign(payload, secret, options)
   * - payload: 토큰에 담을 데이터 (여기서는 userId만 담는다)
   * - secret: 서명 키(비밀키)
   * - options.expiresIn: 만료기간
   */
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

/**
 * ✅ 회원가입 서비스
 * - 컨트롤러는 req/res를 다루지만, 서비스는 "순수 로직"만 다룬다.
 *
 * @param {Object} input - validator가 검증/정규화해 준 값
 * @param {string} input.email
 * @param {string} input.password  - 사용자 입력 원문(이 값은 DB에 그대로 저장하면 안 됨!)
 * @param {string} input.nickname
 * @param {number} input.handicap
 * @returns {Promise<{token: string, user: any}>}
 */
async function register({ email, password, nickname, handicap }) {
  /**
   * 1) 중복 체크 (DB 의존이므로 validator가 아니라 service에서)
   * - 이메일/닉네임 중복은 '잘못된 요청 형식(400)'이 아니라 '충돌(409)'로 보는 것이 일반적
   * - 따라서 HttpError(409)를 던진다.
   */
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new HttpError(409, "email already in use");
  }

  const existingNickname = await User.findOne({ nickname });
  if (existingNickname) {
    throw new HttpError(409, "nickname already in use");
  }

  /**
   * 2) 비밀번호 해시
   * - bcrypt.hash(원문, saltRounds)
   * - saltRounds가 높을수록 안전하지만 느려짐
   * - 학습/개인 서비스에선 10 정도가 흔한 기본값
   */
  const hash = await bcrypt.hash(password, 10);

  /**
   * 3) 유저 생성
   * - A안: 기존 DB 스키마 호환을 위해 "password" 필드명을 유지
   * - 단, 저장되는 값은 반드시 hash여야 한다. (원문 저장 금지)
   */
  const user = await User.create({
    email,
    password: hash, // ✅ 해시 저장
    nickname,
    handicap,
  });

  /**
   * 4) 토큰 발급
   * - 토큰에 userId를 넣어두면, 이후 요청에서 토큰만으로 사용자를 식별 가능
   */
  const token = signToken(user._id.toString());

  /**
   * 5) 컨트롤러로 반환
   * - 컨트롤러가 user.toPublic()을 호출해서 password를 응답에서 제거한다.
   * - 서비스에서 toPublic()까지 해도 되지만, "응답 형태"는 컨트롤러 책임으로 두는 편이 깔끔하다.
   */
  return { token, user };
}

/**
 * ✅ 로그인 서비스
 * - 이메일로 유저 찾고, 비밀번호 비교 성공 시 토큰 발급
 *
 * @param {Object} input
 * @param {string} input.email
 * @param {string} input.password
 * @returns {Promise<{token: string, user: any}>}
 */
async function login({ email, password }) {
  /**
   * 1) 이메일로 사용자 조회
   * - 없는 경우: 인증 실패(401)
   */
  const user = await User.findOne({ email });
  if (!user) {
    // 보안적으로 "email이 틀렸는지" "password가 틀렸는지" 구체적으로 말하지 않는 게 일반적
    throw new HttpError(401, "Invalid credentials");
  }

  /**
   * 2) 비밀번호 검증
   * - bcrypt.compare(입력 원문, 저장 해시)
   * - A안: 저장 해시는 user.password에 들어있다.
   */
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }

  /**
   * 3) 토큰 발급 후 반환
   */
  const token = signToken(user._id.toString());
  return { token, user };
}

module.exports = { register, login };