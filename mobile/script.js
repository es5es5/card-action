const 카드목록 = [
  {
    name: "야근금지",
    rarity: "SR",
    skill: "퇴근 30분 전 새 업무를 받았을 때 단호하게 일정 재조정.",
    attack: 9,
    shield: 6,
    energy: 3,
    gradient: "linear-gradient(180deg, #9d2443 0%, #2b0e18 100%)",
    spreadX: -200,
    spreadY: 14,
    rotateZ: -19,
    rotateY: 18,
    depth: -30,
  },
  {
    name: "회식빠지기찬스",
    rarity: "UR",
    skill: "가족 모임, 병원 예약, 선약까지 완벽한 탈출 사유를 발동.",
    attack: 4,
    shield: 10,
    energy: 5,
    gradient: "linear-gradient(180deg, #dbb14b 0%, #473712 100%)",
    spreadX: -92,
    spreadY: -12,
    rotateZ: -9,
    rotateY: 10,
    depth: 24,
  },
  {
    name: "포상휴가",
    rarity: "SSR",
    skill: "성과 인정 완료. 월요일 오전 전체를 통째로 비워버리는 전설 카드.",
    attack: 10,
    shield: 10,
    energy: 10,
    gradient: "linear-gradient(180deg, #f4d26e 0%, #5b4116 100%)",
    spreadX: 0,
    spreadY: -24,
    rotateZ: 0,
    rotateY: 0,
    depth: 80,
  },
  {
    name: "점심시간 확보",
    rarity: "SR",
    skill: "12시 정각 자리 이탈. 애매한 미팅 요청을 1회 회피한다.",
    attack: 7,
    shield: 5,
    energy: 4,
    gradient: "linear-gradient(180deg, #c83d52 0%, #31111c 100%)",
    spreadX: 92,
    spreadY: 10,
    rotateZ: 13,
    rotateY: -14,
    depth: 10,
  },
  {
    name: "칼퇴부적",
    rarity: "UR",
    skill: "메신저 알림을 잠재우고 상사의 레이더를 교묘하게 피한다.",
    attack: 5,
    shield: 9,
    energy: 6,
    gradient: "linear-gradient(180deg, #ffd46e 0%, #614618 100%)",
    spreadX: 198,
    spreadY: -20,
    rotateZ: 20,
    rotateY: -20,
    depth: -40,
  },
];

const 타이밍 = {
  자동시작지연: 100,
  솟구침시작지연: 60,
  첫폭발지연: 520,
  회전시작지연: 640,
  보상공개지연: 7280,
  보상폭발지연: 260,
  보상카드지연: 180,
  비보상카드지연간격: 22,
  회전지속시간: 6600,
  회전카드간지연: 28,
};

const 궤도설정 = {
  카드간각도: 72,
  회전반경X: 150,
  회전반경Z: 220,
  회전기준Y: -8,
  회전물결Y: 18,
  회전기울기Y: -18,
  배경반경X: 118,
  배경반경Z: 88,
  배경깊이보정: -190,
  배경기준Y: 24,
  배경물결Y: 12,
};

const 회전각목록 = [1080, 960, 840, 720, 600, 480, 360, 240, 120, 30, 0];
const 보상카드인덱스 = 2;

const 카드구름 = document.getElementById("cardCloud");
const 재생버튼 = document.getElementById("triggerButton");
const 중심폭발 = document.querySelector(".burst");
const 충격파 = document.getElementById("shockwave");
const 스파크버스트 = document.getElementById("sparkBurst");
const 보상오라 = document.getElementById("rewardAura");
const 보상카피 = document.getElementById("rewardCopy");
const 보상제목 = 보상카피.querySelector("h2");

let 타이머목록 = [];
let 회전애니메이션목록 = [];
let 스파크목록 = [];

function 도를라디안(도) {
  return (도 * Math.PI) / 180;
}

function 궤도각도구하기(카드인덱스, 회전도 = 0) {
  return 도를라디안((카드인덱스 - 보상카드인덱스) * 궤도설정.카드간각도 + 회전도);
}

function 전면강조도구하기(각도) {
  return (Math.cos(각도) + 1) / 2;
}

function 가시상태적용(요소, 투명도, 필터) {
  요소.style.opacity = String(투명도);
  요소.style.filter = 필터;
}

function 타이머초기화() {
  타이머목록.forEach((타이머) => window.clearTimeout(타이머));
  타이머목록 = [];
}

function 회전애니메이션초기화() {
  회전애니메이션목록.forEach((애니메이션) => 애니메이션.cancel());
  회전애니메이션목록 = [];
}

function 예약(지연시간, 작업) {
  타이머목록.push(window.setTimeout(작업, 지연시간));
}

function 카드생성(카드정보, 카드인덱스) {
  const 카드요소 = document.createElement("article");
  카드요소.className = "card";
  카드요소.style.setProperty("--card-gradient", 카드정보.gradient);
  카드요소.style.zIndex = String(20 + 카드인덱스);

  카드요소.innerHTML = `
    <div class="card-inner">
      <div class="card-art">
        <div class="silhouette"></div>
      </div>
      <div class="card-meta">
        <div class="card-topline">
          <span class="card-name">${카드정보.name}</span>
          <span class="rarity">${카드정보.rarity}</span>
        </div>
        <div class="card-skill">${카드정보.skill}</div>
        <div class="card-stats">
          <span class="card-stat">ATK ${카드정보.attack}</span>
          <span class="card-stat">DEF ${카드정보.shield}</span>
          <span class="card-stat">ENG ${카드정보.energy}</span>
        </div>
      </div>
    </div>
  `;

  카드구름.appendChild(카드요소);
  return 카드요소;
}

const 카드요소목록 = 카드목록.map(카드생성);

function 스파크생성() {
  const 스파크개수 = 18;
  for (let 인덱스 = 0; 인덱스 < 스파크개수; 인덱스 += 1) {
    const 스파크 = document.createElement("span");
    스파크.className = "spark";
    스파크.style.setProperty("--angle", `${인덱스 * (360 / 스파크개수)}deg`);
    스파크.style.setProperty("--distance", `${100 + (인덱스 % 3) * 20}px`);
    스파크.style.animationDelay = `${인덱스 * 18}ms`;
    스파크버스트.appendChild(스파크);
  }
  스파크목록 = Array.from(스파크버스트.querySelectorAll(".spark"));
}

스파크생성();

function 스택변환구하기(카드인덱스) {
  const 흔들림X = (카드인덱스 - 2) * 3;
  const 흔들림Y = 60 + (카드인덱스 % 2 === 0 ? -1 : 1) * 카드인덱스 * 2;
  const 회전 = (카드인덱스 - 2) * 1.4;
  const 깊이Z = 카드인덱스 * 14;
  return `translate3d(${흔들림X}px, ${흔들림Y}px, ${깊이Z}px) rotateZ(${회전}deg) rotateY(0deg) scale(0.65)`;
}

function 솟구침변환구하기(카드인덱스) {
  const 벌어짐X = (카드인덱스 - 2) * 6;
  const 기울기 = (카드인덱스 - 2) * 2.6;
  const 상승Y = -54 - 카드인덱스 * 7;
  const 깊이Z = 20 + 카드인덱스 * 11;
  return `translate3d(${벌어짐X}px, ${상승Y}px, ${깊이Z}px) rotateZ(${기울기}deg) rotateX(-7deg) scale(0.74)`;
}

function 보상변환구하기(카드정보) {
  const 보상스케일 = 카드정보.rarity === "SSR" ? 1.34 : 1.24;
  return `
    translate3d(0px, -22px, 250px)
    rotateZ(0deg)
    rotateY(0deg)
    rotateX(0deg)
    scale(${보상스케일})
  `;
}

function 배경후퇴변환구하기(카드정보, 카드인덱스) {
  const 각도 = 궤도각도구하기(카드인덱스);
  const 이동X = Math.sin(각도) * 궤도설정.배경반경X;
  const 이동Z = Math.cos(각도) * 궤도설정.배경반경Z + 궤도설정.배경깊이보정;
  const 이동Y = 궤도설정.배경기준Y + Math.sin(각도 * 2) * 궤도설정.배경물결Y;
  const 회전Y = Math.sin(각도) * -10;
  return `
    translate3d(${이동X}px, ${이동Y}px, ${이동Z}px)
    rotateZ(${카드정보.rotateZ * 0.22}deg)
    rotateY(${회전Y}deg)
    rotateX(${Math.cos(각도) * -2}deg)
    scale(0.52)
  `;
}

function 회전변환구하기(카드정보, 카드인덱스, 회전도) {
  const 각도 = 궤도각도구하기(카드인덱스, 회전도);
  const 이동X = Math.sin(각도) * 궤도설정.회전반경X;
  const 이동Z = Math.cos(각도) * 궤도설정.회전반경Z;
  const 이동Y = 궤도설정.회전기준Y + Math.sin(각도 * 2) * 궤도설정.회전물결Y;
  const 회전Y = Math.sin(각도) * 궤도설정.회전기울기Y;
  const 전면비율 = (이동Z + 궤도설정.회전반경Z) / (궤도설정.회전반경Z * 2);
  const 스케일 = 0.48 + 전면비율 * 0.76;
  return `
    translate3d(${이동X}px, ${이동Y}px, ${이동Z}px)
    rotateZ(${카드정보.rotateZ * 0.28}deg)
    rotateY(${회전Y}deg)
    rotateX(${Math.cos(각도) * -4}deg)
    scale(${스케일})
  `;
}

function 회전시각상태구하기(카드인덱스, 회전도) {
  const 각도 = 궤도각도구하기(카드인덱스, 회전도);
  const 강조도 = 전면강조도구하기(각도);
  return {
    opacity: 0.16 + 강조도 * 0.84,
    filter: `saturate(${0.6 + 강조도 * 0.52}) brightness(${0.48 + 강조도 * 0.62})`,
  };
}

function 스택상태로초기화() {
  회전애니메이션초기화();
  카드구름.classList.remove("is-launching", "is-dropping");
  중심폭발.classList.remove("is-flashing");
  충격파.classList.remove("is-firing");
  보상오라.classList.remove("is-visible");
  보상카피.classList.remove("is-visible");
  스파크목록.forEach((스파크) => 스파크.classList.remove("is-firing"));

  카드요소목록.forEach((카드요소, 카드인덱스) => {
    카드요소.classList.remove("is-launching", "is-orbiting", "is-dimmed", "is-reward");
    카드요소.classList.add("is-active", "is-stacked");
    카드요소.style.transitionDelay = `${카드인덱스 * 22}ms`;
    카드요소.style.zIndex = String(20 + 카드인덱스);
    가시상태적용(카드요소, 1, "");
    카드요소.style.transform = 스택변환구하기(카드인덱스);
  });
}

function 회전중상태고정() {
  카드요소목록.forEach((카드요소) => {
    const 계산된스타일 = window.getComputedStyle(카드요소);
    카드요소.style.transform = 계산된스타일.transform === "none" ? "" : 계산된스타일.transform;
    카드요소.style.opacity = 계산된스타일.opacity;
    카드요소.style.filter = 계산된스타일.filter;
  });
}

function 카드뭉치솟구치기() {
  카드구름.classList.remove("is-dropping");
  카드구름.classList.add("is-launching");
  카드요소목록.forEach((카드요소, 카드인덱스) => {
    카드요소.classList.add("is-launching", "is-active", "is-stacked");
    카드요소.style.transitionDelay = `${카드인덱스 * 22}ms`;
    카드요소.style.transform = 솟구침변환구하기(카드인덱스);
  });
}

function 폭발재생() {
  중심폭발.classList.remove("is-flashing");
  충격파.classList.remove("is-firing");
  스파크목록.forEach((스파크) => {
    스파크.classList.remove("is-firing");
    void 스파크.offsetWidth;
    스파크.classList.add("is-firing");
  });
  void 중심폭발.offsetWidth;
  중심폭발.classList.add("is-flashing");
  충격파.classList.add("is-firing");
}

function 카드회전시작() {
  보상카피.classList.remove("is-visible");
  보상오라.classList.remove("is-visible");
  회전애니메이션초기화();
  카드구름.classList.remove("is-launching");
  카드구름.classList.add("is-dropping");

  카드요소목록.forEach((카드요소, 카드인덱스) => {
    const 카드정보 = 카드목록[카드인덱스];
    카드요소.classList.remove("is-dimmed", "is-reward");
    카드요소.classList.add("is-orbiting");
    카드요소.style.transitionDelay = "0ms";
    카드요소.style.zIndex = String(40 + (카드인덱스 === 보상카드인덱스 ? 10 : 0));
    가시상태적용(카드요소, 1, "saturate(1.02) brightness(1)");

    const 회전키프레임 = 회전각목록.map((회전도) => {
      const 시각상태 = 회전시각상태구하기(카드인덱스, 회전도);
      return {
        transform: 회전변환구하기(카드정보, 카드인덱스, 회전도),
        opacity: String(시각상태.opacity),
        filter: 시각상태.filter,
      };
    });

    const 회전애니메이션 = 카드요소.animate(회전키프레임, {
      duration: 타이밍.회전지속시간,
      easing: "cubic-bezier(0.08, 0.82, 0.1, 1)",
      fill: "forwards",
      delay: 카드인덱스 * 타이밍.회전카드간지연,
    });

    회전애니메이션.onfinish = () => {
      const 마지막시각상태 = 회전시각상태구하기(카드인덱스, 0);
      카드요소.style.transform = 회전변환구하기(카드정보, 카드인덱스, 0);
      가시상태적용(카드요소, 마지막시각상태.opacity, 마지막시각상태.filter);
    };

    회전애니메이션목록.push(회전애니메이션);
  });
}

function 보상카드공개() {
  const 보상카드정보 = 카드목록[보상카드인덱스];
  보상제목.textContent = 보상카드정보.name;
  회전중상태고정();
  회전애니메이션초기화();
  void 카드구름.offsetWidth;

  카드요소목록.forEach((카드요소, 카드인덱스) => {
    const 카드정보 = 카드목록[카드인덱스];
    카드요소.classList.remove("is-orbiting");
    카드요소.style.transitionDelay =
      카드인덱스 === 보상카드인덱스
        ? `${타이밍.보상카드지연}ms`
        : `${카드인덱스 * 타이밍.비보상카드지연간격}ms`;

    if (카드인덱스 === 보상카드인덱스) {
      카드요소.classList.add("is-reward");
      카드요소.classList.remove("is-dimmed");
      카드요소.style.zIndex = "120";
      가시상태적용(카드요소, 1, "saturate(1.16) brightness(1.08)");
      카드요소.style.transform = 보상변환구하기(카드정보);
      return;
    }

    카드요소.classList.remove("is-reward");
    카드요소.classList.add("is-dimmed");
    카드요소.style.zIndex = String(10 + 카드인덱스);
    카드요소.style.transform = 배경후퇴변환구하기(카드정보, 카드인덱스);
  });

  보상오라.classList.add("is-visible");
  보상카피.classList.add("is-visible");
  예약(타이밍.보상폭발지연, 폭발재생);
}

function 애니메이션재생() {
  타이머초기화();
  스택상태로초기화();
  예약(타이밍.솟구침시작지연, 카드뭉치솟구치기);
  예약(타이밍.첫폭발지연, 폭발재생);
  예약(타이밍.회전시작지연, 카드회전시작);
  예약(타이밍.보상공개지연, 보상카드공개);
}

재생버튼.addEventListener("click", 애니메이션재생);
스택상태로초기화();
예약(타이밍.자동시작지연, 애니메이션재생);
