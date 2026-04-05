const cards = [
  {
    name: "야근금지",
    rarity: "SR",
    skill: "퇴근 30분 전 새 업무를 받았을 때 단호하게 일정 재조정.",
    attack: 9,
    shield: 6,
    energy: 3,
    gradient: "linear-gradient(180deg, #9d2443 0%, #2b0e18 100%)",
    spreadX: -280,
    spreadY: 24,
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
    spreadX: -130,
    spreadY: -16,
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
    spreadY: -44,
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
    spreadX: 156,
    spreadY: 14,
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
    spreadX: 292,
    spreadY: -28,
    rotateZ: 20,
    rotateY: -20,
    depth: -40,
  },
];

const cloud = document.getElementById("cardCloud");
const triggerButton = document.getElementById("triggerButton");
const burst = document.querySelector(".burst");
const shockwave = document.getElementById("shockwave");
const sparkBurst = document.getElementById("sparkBurst");
const rewardAura = document.getElementById("rewardAura");
const rewardCopy = document.getElementById("rewardCopy");
let cycleTimers = [];
const rewardIndex = 2;
let orbitAnimations = [];

function createCard(card, index) {
  const article = document.createElement("article");
  article.className = "card";
  article.style.setProperty("--card-gradient", card.gradient);
  article.style.zIndex = String(20 + index);

  article.innerHTML = `
    <div class="card-inner">
      <div class="card-art">
        <div class="silhouette"></div>
      </div>
      <div class="card-meta">
        <div class="card-topline">
          <span class="card-name">${card.name}</span>
          <span class="rarity">${card.rarity}</span>
        </div>
        <div class="card-skill">${card.skill}</div>
        <div class="card-stats">
          <span class="card-stat">ATK ${card.attack}</span>
          <span class="card-stat">DEF ${card.shield}</span>
          <span class="card-stat">ENG ${card.energy}</span>
        </div>
      </div>
    </div>
  `;

  cloud.appendChild(article);
  return article;
}

const cardElements = cards.map(createCard);

function createSparks() {
  const sparkCount = 18;

  for (let index = 0; index < sparkCount; index += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.setProperty("--angle", `${index * (360 / sparkCount)}deg`);
    spark.style.setProperty("--distance", `${140 + (index % 3) * 26}px`);
    spark.style.animationDelay = `${index * 18}ms`;
    sparkBurst.appendChild(spark);
  }
}

createSparks();

function stackTransform(index) {
  const jitterX = (index - 2) * 5;
  const jitterY = 88 + (index % 2 === 0 ? -1 : 1) * index * 3;
  const rotate = (index - 2) * 1.6;
  const z = index * 18;

  return `translate3d(${jitterX}px, ${jitterY}px, ${z}px) rotateZ(${rotate}deg) rotateY(0deg) scale(0.65)`;
}

function launchTransform(index) {
  const spread = (index - 2) * 8;
  const tilt = (index - 2) * 3.2;
  const lift = -72 - index * 8;
  const z = 26 + index * 14;

  return `translate3d(${spread}px, ${lift}px, ${z}px) rotateZ(${tilt}deg) rotateX(-7deg) scale(0.74)`;
}

function rewardTransform(card) {
  return `
    translate3d(0px, -46px, 320px)
    rotateZ(0deg)
    rotateY(0deg)
    rotateX(0deg)
    scale(${card.rarity === "SSR" ? 1.32 : 1.22})
  `;
}

function carouselTransform(card, index, rotationDeg) {
  const angleDeg = (index - rewardIndex) * 72 + rotationDeg;
  const angle = (angleDeg * Math.PI) / 180;
  const x = Math.sin(angle) * 380;
  const z = Math.cos(angle) * 300;
  const y = -34 + Math.sin(angle * 2) * 24;
  const face = Math.sin(angle) * -22;
  const frontRatio = (z + 300) / 600;
  const scale = 0.54 + frontRatio * 0.78;

  return `
    translate3d(${x}px, ${y}px, ${z}px)
    rotateZ(${card.rotateZ * 0.32}deg)
    rotateY(${face}deg)
    rotateX(${Math.cos(angle) * -4}deg)
    scale(${scale})
  `;
}

function resetToStack() {
  orbitAnimations.forEach((animation) => animation.cancel());
  orbitAnimations = [];
  cloud.classList.remove("is-launching", "is-dropping");
  burst.classList.remove("is-flashing");
  shockwave.classList.remove("is-firing");
  rewardAura.classList.remove("is-visible");
  rewardCopy.classList.remove("is-visible");
  sparkBurst.querySelectorAll(".spark").forEach((spark) => {
    spark.classList.remove("is-firing");
  });
  cardElements.forEach((element, index) => {
    element.classList.remove(
      "is-featured",
      "is-launching",
      "is-hovered",
      "is-orbiting",
      "is-dimmed",
      "is-reward"
    );
    element.classList.add("is-active", "is-stacked");
    element.style.transitionDelay = `${index * 28}ms`;
    element.style.zIndex = String(20 + index);
    element.style.opacity = "1";
    element.style.filter = "";
    element.style.transform = stackTransform(index);
  });
}

function launchStack() {
  cloud.classList.remove("is-dropping");
  cloud.classList.add("is-launching");
  cardElements.forEach((element, index) => {
    element.classList.add("is-launching");
    element.classList.add("is-active", "is-stacked");
    element.style.transitionDelay = `${index * 26}ms`;
    element.style.transform = launchTransform(index);
  });
}

function fireBurst() {
  burst.classList.remove("is-flashing");
  shockwave.classList.remove("is-firing");
  sparkBurst.querySelectorAll(".spark").forEach((spark) => {
    spark.classList.remove("is-firing");
    void spark.offsetWidth;
    spark.classList.add("is-firing");
  });

  void burst.offsetWidth;
  burst.classList.add("is-flashing");
  shockwave.classList.add("is-firing");
}

function orbitCards() {
  rewardCopy.classList.remove("is-visible");
  rewardAura.classList.remove("is-visible");
  orbitAnimations.forEach((animation) => animation.cancel());
  orbitAnimations = [];
  cloud.classList.remove("is-launching");
  cloud.classList.add("is-dropping");

  cardElements.forEach((element, index) => {
    const card = cards[index];
    element.classList.remove("is-featured", "is-dimmed", "is-reward");
    element.classList.add("is-orbiting");
    element.style.transitionDelay = "0ms";
    element.style.zIndex = String(40 + (index === rewardIndex ? 10 : 0));
    element.style.opacity = "1";
    element.style.filter = "saturate(1.02) brightness(1)";

    const orbitKeyframes = [1800, 1560, 1290, 1020, 750, 510, 300, 150, 54, 0].map((rotationDeg) => {
      const angle = (((index - rewardIndex) * 72 + rotationDeg) * Math.PI) / 180;
      const emphasis = (Math.cos(angle) + 1) / 2;
      return {
        transform: carouselTransform(card, index, rotationDeg),
        opacity: `${0.18 + emphasis * 0.82}`,
        filter: `saturate(${0.62 + emphasis * 0.5}) brightness(${0.5 + emphasis * 0.6})`,
      };
    });

    const animation = element.animate(orbitKeyframes, {
      duration: 5000,
      easing: "cubic-bezier(0.08, 0.82, 0.1, 1)",
      fill: "forwards",
      delay: index * 28,
    });

    animation.onfinish = () => {
      const endAngle = (((index - rewardIndex) * 72) * Math.PI) / 180;
      const endEmphasis = (Math.cos(endAngle) + 1) / 2;
      element.style.transform = carouselTransform(card, index, 0);
      element.style.opacity = `${0.18 + endEmphasis * 0.82}`;
      element.style.filter = `saturate(${0.62 + endEmphasis * 0.5}) brightness(${0.5 + endEmphasis * 0.6})`;
    };

    orbitAnimations.push(animation);
  });
}

function revealReward() {
  const rewardCard = cards[rewardIndex];
  rewardCopy.querySelector("h2").textContent = rewardCard.name;
  orbitAnimations.forEach((animation) => animation.cancel());
  orbitAnimations = [];

  cardElements.forEach((element, index) => {
    const card = cards[index];
    element.classList.remove("is-orbiting");
    element.style.transitionDelay = index === rewardIndex ? "120ms" : `${index * 20}ms`;

    if (index === rewardIndex) {
      element.classList.add("is-reward");
      element.classList.remove("is-dimmed");
      element.style.zIndex = "120";
      element.style.opacity = "1";
      element.style.filter = "saturate(1.16) brightness(1.08)";
      element.style.transform = rewardTransform(card);
      return;
    }

    element.classList.remove("is-reward", "is-featured");
    element.classList.add("is-dimmed");
    element.style.zIndex = String(10 + index);
    element.style.transform = `
      translate3d(${(index - rewardIndex) * 112}px, ${66 + Math.abs(index - rewardIndex) * 12}px, ${-220 - index * 18}px)
      rotateZ(${card.rotateZ * 0.7}deg)
      rotateY(${card.rotateY * 0.5}deg)
      rotateX(0deg)
      scale(0.72)
    `;
  });

  rewardAura.classList.add("is-visible");
  rewardCopy.classList.add("is-visible");
  cycleTimers.push(
    window.setTimeout(() => {
      fireBurst();
    }, 140)
  );
}

function clearCycleTimers() {
  cycleTimers.forEach((timer) => window.clearTimeout(timer));
  cycleTimers = [];
}

function animateCycle() {
  clearCycleTimers();
  resetToStack();

  cycleTimers.push(
    window.setTimeout(() => {
      launchStack();
    }, 60)
  );

  cycleTimers.push(
    window.setTimeout(() => {
      fireBurst();
    }, 520)
  );

  cycleTimers.push(
    window.setTimeout(() => {
      orbitCards();
    }, 640)
  );

  cycleTimers.push(
    window.setTimeout(() => {
      revealReward();
    }, 5680)
  );
}

triggerButton.addEventListener("click", () => {
  animateCycle();
});

resetToStack();
cycleTimers.push(
  window.setTimeout(() => {
    animateCycle();
  }, 100)
);
