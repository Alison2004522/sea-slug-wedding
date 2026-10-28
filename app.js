/**
 * 海蛞蝓愛海蛞蝓：波光城最閃亮的婚禮
 * 全新 14 單元雙頁滿版／大跨頁互動繪本引擎
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. 全域狀態管理 (State)
  // ==========================================
  const state = {
    currentUnit: 1,
    totalUnits: 14,
    audioEnabled: false,
    isNarrating: false,
    isFlipping: false,
    spotlightFound: new Set(),
    bubblesResolved: new Set(),
    liangOutfit: { hat: null, cloth: null },
    shanOutfit: { hat: null, cloth: null },
    harmonyScore: 20,
    weavePointsPassed: 0,
    selectedStamps: new Set(),
    studentCode: ""
  };

  // ==========================================
  // 2. DOM 節點快取
  // ==========================================
  const dom = {
    unitScreens: document.querySelectorAll(".unit-screen"),
    curUnitDisplay: document.getElementById("cur-unit-display"),
    totalUnitDisplay: document.getElementById("total-unit-display"),
    progressFill: document.getElementById("progress-fill"),
    btnPrev: document.getElementById("btn-prev-page"),
    btnNext: document.getElementById("btn-next-page"),
    tocSelect: document.getElementById("toc-select"),
    btnNarrate: document.getElementById("btn-audio-narrate"),
    btnToggleSound: document.getElementById("btn-toggle-sound"),
    btnFullscreen: document.getElementById("btn-fullscreen"),
    btnStartReading: document.getElementById("btn-start-reading")
  };

  // ==========================================
  // 全域深海魔法粒子特效引擎 (ParticleFX)
  // ==========================================
  const ParticleFX = (() => {
    const canvas = document.getElementById("fx-canvas");
    if (!canvas) return { burst: () => {}, addSonar: () => {} };
    const ctx = canvas.getContext("2d");
    let particles = [];
    let sonarWaves = [];

    function resize() {
      const stage = document.getElementById("book-stage");
      if (!stage) return;
      canvas.width = stage.clientWidth;
      canvas.height = stage.clientHeight;
    }
    window.addEventListener("resize", resize);
    setTimeout(resize, 100);

    class Particle {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        this.decay = 0.016 + Math.random() * 0.02;

        if (type === "bubble") {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.8 + Math.random() * 4.5;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 1.2;
          this.size = 6 + Math.random() * 12;
          this.color = ["#38bdf8", "#f472b6", "#facc15", "#a7f3d0", "#ffffff"][Math.floor(Math.random() * 5)];
        } else if (type === "confetti") {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 2.5;
          this.gravity = 0.14;
          this.size = 8 + Math.random() * 8;
          this.rot = Math.random() * Math.PI * 2;
          this.vRot = (Math.random() - 0.5) * 0.22;
          this.color = ["#f43f5e", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"][Math.floor(Math.random() * 6)];
        } else if (type === "sparkle") {
          this.vx = (Math.random() - 0.5) * 2.2;
          this.vy = -(1.5 + Math.random() * 3.5);
          this.size = 5 + Math.random() * 8;
          this.color = ["#fef08a", "#fbcfe8", "#bae6fd", "#fed7aa"][Math.floor(Math.random() * 4)];
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.type === "bubble") {
          this.vy -= 0.05;
          this.vx *= 0.98;
        } else if (this.type === "confetti") {
          this.vy += this.gravity;
          this.vx *= 0.98;
          this.rot += this.vRot;
        } else if (this.type === "sparkle") {
          this.size *= 0.96;
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);

        if (this.type === "bubble") {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (this.type === "confetti") {
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rot);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        } else if (this.type === "sparkle") {
          ctx.translate(this.x, this.y);
          ctx.fillStyle = this.color;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(this.size, 0);
            ctx.lineTo(this.size * 0.3, this.size * 0.3);
          }
          ctx.fill();
        }
        ctx.restore();
      }
    }

    class SonarWave {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.alpha = 0.85;
      }
      update() {
        this.r += 3.8;
        this.alpha -= 0.024;
      }
      draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(253, 224, 71, ${this.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sonarWaves.length - 1; i >= 0; i--) {
        sonarWaves[i].update();
        sonarWaves[i].draw(ctx);
        if (sonarWaves[i].alpha <= 0) sonarWaves.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return {
      resize,
      burst(x, y, type = "bubble", count = 25) {
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(x, y, type));
        }
      },
      addSonar(x, y) {
        if (sonarWaves.length < 3) {
          sonarWaves.push(new SonarWave(x, y));
        }
      }
    };
  })();

  // ==========================================
  // 3. 翻頁導覽系統 (Unit/Page Navigation - 3D 繪本擬真翻頁)
  // ==========================================
  function goToUnit(unitNum) {
    if (unitNum < 1 || unitNum > state.totalUnits) return;
    if (unitNum === state.currentUnit) return;
    if (state.isFlipping) return; // 動畫播放期間防連點保護

    // 停止正在進行的朗讀
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      state.isNarrating = false;
      updateNarrateBtnUI();
    }

    const oldUnit = state.currentUnit;
    const isNext = unitNum > oldUnit;
    const currentScreen = document.getElementById(`unit-${oldUnit}`);
    const nextScreen = document.getElementById(`unit-${unitNum}`);

    state.currentUnit = unitNum;

    // 即時更新進度條與控制項
    dom.curUnitDisplay.textContent = unitNum;
    dom.tocSelect.value = unitNum;
    dom.progressFill.style.width = `${(unitNum / state.totalUnits) * 100}%`;
    dom.btnPrev.disabled = unitNum === 1;
    dom.btnNext.disabled = unitNum === state.totalUnits;

    // 觸發配樂延續
    updateBgmForUnit(unitNum);

    // 執行擬真 3D 繪本翻頁動畫
    if (currentScreen && nextScreen) {
      state.isFlipping = true;

      // 清除舊有的動畫樣式
      currentScreen.className = "unit-screen active";
      nextScreen.className = "unit-screen";

      if (isNext) {
        // 向後翻頁（下一頁）：當前頁向左掀起，下一頁展開進場
        currentScreen.classList.add("turning-current", "flip-out-left");
        nextScreen.classList.add("turning-next", "flip-in-right");
      } else {
        // 向前翻頁（上一頁）：當前頁向右掀起，上一頁蓋回進場
        currentScreen.classList.add("turning-current", "flip-out-right");
        nextScreen.classList.add("turning-next", "flip-in-left");
      }

      // 0.52 秒後動畫完畢，清理類別並還原純淨狀態
      setTimeout(() => {
        dom.unitScreens.forEach(screen => {
          const u = parseInt(screen.dataset.unit);
          screen.classList.remove(
            "turning-current", "turning-next",
            "flip-out-left", "flip-out-right",
            "flip-in-left", "flip-in-right"
          );
          screen.classList.toggle("active", u === unitNum);
        });

        state.isFlipping = false;
        onUnitEnter(unitNum);
      }, 520);
    } else {
      // 降級純淨切換
      dom.unitScreens.forEach(screen => {
        const u = parseInt(screen.dataset.unit);
        screen.classList.toggle("active", u === unitNum);
      });
      onUnitEnter(unitNum);
    }
  }

  dom.btnPrev.addEventListener("click", () => goToUnit(state.currentUnit - 1));
  dom.btnNext.addEventListener("click", () => goToUnit(state.currentUnit + 1));
  dom.tocSelect.addEventListener("change", (e) => goToUnit(parseInt(e.target.value)));
  if (dom.btnStartReading) {
    dom.btnStartReading.addEventListener("click", () => {
      // 點擊「翻開繪本」時順暢解鎖音訊並自動啟用背景音
      if (!state.audioEnabled) {
        state.audioEnabled = true;
        dom.btnToggleSound.classList.add("active");
        bgmAudio.play().catch(() => {});
      }
      goToUnit(2);
    });
  }

  // 鍵盤左右鍵翻頁
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight") goToUnit(state.currentUnit + 1);
    if (e.key === "ArrowLeft") goToUnit(state.currentUnit - 1);
  });

  // 全螢幕切換
  dom.btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // ==========================================
  // 4. 語音朗讀系統 (Web Speech API)
  // ==========================================
  function narrateCurrentUnit() {
    if (!('speechSynthesis' in window)) {
      alert("您的瀏覽器暫不支援語音朗讀功能。");
      return;
    }

    if (state.isNarrating) {
      window.speechSynthesis.cancel();
      state.isNarrating = false;
      updateNarrateBtnUI();
      return;
    }

    const curScreen = document.getElementById(`unit-${state.currentUnit}`);
    const textElements = curScreen.querySelectorAll(".floating-text-box");
    if (!textElements || textElements.length === 0) return;

    let fullSpeech = "";
    textElements.forEach(box => {
      const nar = box.dataset.narrate || box.innerText;
      fullSpeech += nar + " ";
    });

    const utter = new SpeechSynthesisUtterance(fullSpeech);
    utter.lang = "zh-TW";
    utter.rate = 0.95; // 舒緩繪本語調
    
    utter.onstart = () => {
      state.isNarrating = true;
      updateNarrateBtnUI();
      if (bgmAudio && state.audioEnabled) {
        bgmAudio.volume = 0.15; // 朗讀時降低背景音量
      }
    };
    utter.onend = () => {
      state.isNarrating = false;
      updateNarrateBtnUI();
      if (bgmAudio && state.audioEnabled) {
        bgmAudio.volume = 0.45; // 朗讀結束恢復音量
      }
    };
    utter.onerror = () => {
      state.isNarrating = false;
      updateNarrateBtnUI();
      if (bgmAudio && state.audioEnabled) {
        bgmAudio.volume = 0.45;
      }
    };

    window.speechSynthesis.speak(utter);
  }

  function updateNarrateBtnUI() {
    dom.btnNarrate.classList.toggle("active", state.isNarrating);
    dom.btnNarrate.querySelector(".label").textContent = state.isNarrating ? "停止" : "朗讀";
  }

  dom.btnNarrate.addEventListener("click", narrateCurrentUnit);

  // ==========================================
  // 5. 繪本真實音訊引擎（背景音循環 ＆ 點擊音效池）
  // ==========================================
  // 背景音樂（全書平滑循環播放：已套用老師修剪版「背景音樂修剪版.mp3」，從頭無縫平滑循環）
  const bgmAudio = new Audio("music/bgm.mp3?v=" + Date.now());
  bgmAudio.loop = true;
  bgmAudio.volume = 0.45;

  // 畫面與遊戲專屬點擊音效（基礎功能導覽無音效）
  function playClickSFX() {
    if (!state.audioEnabled) return;
    try {
      const sfx = new Audio("music/click_sfx.mp3");
      sfx.volume = 0.85;
      sfx.play().catch(() => {});
    } catch (e) {}
  }

  // 映射現有互動音效至使用者的實體點擊音檔
  function playTone() {
    playClickSFX();
  }

  function updateBgmForUnit(unitNum) {
    // 翻頁時背景音樂持續自然流淌，不中斷、不重新開頭
    if (state.audioEnabled && bgmAudio.paused) {
      bgmAudio.play().catch(() => {});
    }
  }

  dom.btnToggleSound.addEventListener("click", () => {
    state.audioEnabled = !state.audioEnabled;
    dom.btnToggleSound.classList.toggle("active", state.audioEnabled);
    if (state.audioEnabled) {
      bgmAudio.play().catch(() => {});
    } else {
      bgmAudio.pause();
    }
  });

  // ==========================================
  // 6. 單元生命週期派發 (Game Event Dispatch)
  // ==========================================
  function onUnitEnter(unitNum) {
    if (unitNum === 4) {
      initLevel1Invitations();
      const introCard = document.getElementById("invitation-intro-card");
      if (introCard) introCard.classList.remove("hidden");
    }
    if (unitNum === 6) {
      initLevel2Bubbles();
      if (typeof resetLevel2Bubbles === "function") {
        resetLevel2Bubbles();
      }
    }
    if (unitNum === 8) {
      initLevel3Salon();
      const introCard = document.getElementById("salon-intro-card");
      if (introCard) introCard.classList.remove("hidden");
    }
    if (unitNum === 10) initLevel4StageDeco();
    if (unitNum === 11) initLevel5Weave();
    if (unitNum === 12) initUnit12Fireworks();
    if (unitNum === 13) initLevel6Reflection();
  }

  // ------------------------------------------
  // 【關卡 1・單元 4】波光城的神祕邀請函 (Mysterious Invitations)
  // ------------------------------------------
  let invitationsInited = false;
  let resetLevel1Invitations = null;

  // 四封邀請函生物知識資料庫
  const invitationCardsData = [
    {
      id: 1,
      target: "crab",
      residentName: "螃蟹阿姨",
      cheerImg: "images/level1/cheer_crab.png",
      hints: [
        "我的盔甲不會跟著身體一起長大，想長大，就得先換掉舊盔甲。",
        "保護我的硬殼長在身體外面，身旁還有分節的附肢。",
        "我有一對大螯，看起來像兩把鉗子；你常能看見我橫著走。"
      ],
      knowledge: {
        title: "螃蟹｜長大要換盔甲",
        content: "螃蟹身體外面的硬殼叫作外骨骼。因為硬殼無法一直隨著身體變大，螃蟹成長時需要蛻殼。剛蛻殼時，新殼還很柔軟，需要時間變硬。"
      }
    },
    {
      id: 2,
      target: "octopus",
      residentName: "章魚裁縫師",
      cheerImg: "images/level1/cheer_octopus.png",
      hints: [
        "我的身體裡有三顆心臟，分工合作，幫助血液循環。",
        "我的身體柔軟，腕足上的吸盤不只能抓住東西，也能感受接觸到的物體。",
        "我有八隻腕足，上面排列著吸盤，是海中的八腕高手。"
      ],
      knowledge: {
        title: "章魚｜三顆心臟的八腕高手",
        content: "章魚有八隻腕足，也有三顆心臟。其中兩顆將血液送往鰓，另一顆將血液送往身體其他部位。腕足上的吸盤能協助抓握與感知周遭。"
      }
    },
    {
      id: 3,
      target: "jellyfish",
      residentName: "老水母",
      cheerImg: "images/level1/cheer_jellyfish.png",
      hints: [
        "我沒有像人類一樣集中的大腦，卻能利用遍布身體的神經網感應環境。",
        "我的身體柔軟，含有大量水分，會隨著海流漂動，也能靠身體收縮移動。",
        "我的身體像一把柔軟的傘，下方垂著觸手；有些同類看起來半透明。"
      ],
      knowledge: {
        title: "水母｜用神經網感應世界",
        content: "水母沒有像人類一樣集中的大腦，而是透過神經網感應環境。牠們能收縮傘狀身體，幫助自己在水中移動，也常隨著海流漂動。"
      }
    },
    {
      id: 4,
      target: "dolphin",
      residentName: "海豚寶寶",
      cheerImg: "images/level1/cheer_dolphin.png",
      hints: [
        "我會發出聲音，再利用傳回來的回聲，判斷周圍物體的位置。",
        "雖然住在海裡，我卻用肺呼吸，必須回到水面換氣；我也是哺乳類動物。",
        "我的身體流線，頭頂有呼吸孔，尾鰭上下擺動；你有時能看見我躍出海面。"
      ],
      knowledge: {
        title: "海豚｜用回聲探索海洋",
        content: "海豚是哺乳類動物，使用肺呼吸，需要到水面透過頭頂的呼吸孔換氣。牠們也能利用回聲定位，協助辨認周圍物體與尋找獵物。"
      }
    }
  ];

  // 關卡內部狀態機
  const invitationState = {
    activeId: 1, // 目前選中的邀請函 ID (1~4)
    letters: {
      1: { currentHintLevel: 1, delivered: false },
      2: { currentHintLevel: 1, delivered: false },
      3: { currentHintLevel: 1, delivered: false },
      4: { currentHintLevel: 1, delivered: false }
    },
    isDelivering: false
  };

  function initLevel1Invitations() {
    if (invitationsInited) return;
    invitationsInited = true;

    // DOM 元素快取
    const introCard = document.getElementById("invitation-intro-card");
    const btnStartChallenge = document.getElementById("btn-start-invitation-challenge");
    const progressText = document.getElementById("invitation-progress-text");
    const activeEnvCode = document.getElementById("active-env-code");
    const hintTierBadge = document.getElementById("hint-tier-badge");
    const currentHintText = document.getElementById("current-hint-text");
    const btnMoreHint = document.getElementById("btn-request-more-hint");
    const btnSwitchOther = document.getElementById("btn-switch-other-letter");
    const feedbackMsg = document.getElementById("hint-feedback-msg");
    const feedbackText = document.getElementById("invitation-feedback-text");
    const feedbackIcon = document.getElementById("invitation-feedback-icon");
    const draggableEnvelope = document.getElementById("draggable-envelope");

    // 關卡 1 說明小視窗：點擊「開始送信挑戰」進入遊戲
    if (btnStartChallenge) {
      btnStartChallenge.addEventListener("click", () => {
        playClickSFX();
        if (introCard) introCard.classList.add("hidden");
      });
    }

    // 彈窗元素
    const helpModal = document.getElementById("invitation-help-modal");
    const btnShowHelp = document.getElementById("btn-show-invitation-help");
    const btnCloseHelp = document.getElementById("btn-close-invitation-help");

    const knowledgeModal = document.getElementById("invitation-knowledge-modal");
    const knowledgeCheerImg = document.getElementById("knowledge-cheer-img");
    const knowledgeTitle = document.getElementById("knowledge-title");
    const knowledgeBody = document.getElementById("knowledge-body");
    const btnCloseKnowledge = document.getElementById("btn-close-knowledge-card");

    const victoryModal = document.getElementById("invitation-victory-modal");
    const btnReviewCards = document.getElementById("btn-review-knowledge-cards");
    const btnReplayGame = document.getElementById("btn-replay-invitation-game");
    const btnContinueStory = document.getElementById("btn-invitation-continue-story");

    const reviewModal = document.getElementById("knowledge-review-modal");
    const reviewDetail = document.getElementById("review-card-detail");
    const btnCloseReview = document.getElementById("btn-close-review-modal");

    // 送信動畫元素
    const animOverlay = document.getElementById("delivery-anim-overlay");
    const flyingLetter = document.getElementById("flying-letter");

    // 取得當前未完成的邀請函數量
    function getRemainingUndeliveredCount() {
      let count = 0;
      for (let i = 1; i <= 4; i++) {
        if (!invitationState.letters[i].delivered) count++;
      }
      return count;
    }

    // 取得下一個未完成的邀請函 ID
    function getNextUndeliveredId(startId) {
      for (let step = 1; step <= 4; step++) {
        const nextId = ((startId - 1 + step) % 4) + 1;
        if (!invitationState.letters[nextId].delivered) return nextId;
      }
      return null;
    }

    // 更新目前邀請函的介面呈現
    function renderCurrentLetter() {
      const id = invitationState.activeId;
      const data = invitationCardsData.find(item => item.id === id);
      const curLetter = invitationState.letters[id];

      // 停止舊語音朗讀
      if (window.speechSynthesis) window.speechSynthesis.cancel();

      // 更新目前信件編號
      if (activeEnvCode) activeEnvCode.textContent = `邀請函 0${id}`;

      // 提示層級與單條提示文字（始終只保留當前這條，不累積）
      const level = curLetter.currentHintLevel; // 1~3
      if (hintTierBadge) hintTierBadge.textContent = `提示 ${level}／3`;
      if (currentHintText) {
        currentHintText.textContent = data.hints[level - 1];
        // 平滑淡入動畫
        currentHintText.parentElement.style.animation = "none";
        void currentHintText.parentElement.offsetWidth;
        currentHintText.parentElement.style.animation = "hintFadeIn 0.3s ease-out";
      }

      // 按鈕狀態：若已到第 3 條提示，停用按鈕並更改文字
      if (btnMoreHint) {
        if (level >= 3) {
          btnMoreHint.disabled = true;
          btnMoreHint.textContent = "已是最後一條提示";
        } else {
          btnMoreHint.disabled = false;
          btnMoreHint.textContent = "再給我一個提示 💡";
        }
      }

      // 隱藏回饋訊息與切換按鈕
      if (feedbackMsg) feedbackMsg.classList.add("hidden");
      if (btnSwitchOther) btnSwitchOther.classList.add("hidden");

      // 更新四封信按鈕選取狀態
      for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`env-btn-${i}`);
        const stateTag = document.getElementById(`env-state-${i}`);
        if (btn) {
          btn.classList.toggle("active", i === id);
          btn.classList.toggle("delivered-badge", invitationState.letters[i].delivered);
        }
        if (stateTag) {
          if (invitationState.letters[i].delivered) {
            stateTag.textContent = "已送達 ✓";
          } else if (i === id) {
            stateTag.textContent = "進行中";
          } else {
            stateTag.textContent = "未送達";
          }
        }
      }
    }

    // 點擊四封邀請函切換標籤
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`env-btn-${i}`);
      if (btn) {
        btn.addEventListener("click", () => {
          if (invitationState.isDelivering) return;
          playClickSFX();
          invitationState.activeId = i;
          renderCurrentLetter();
        });
      }
    }

    // 手動索取提示按鈕：「再給我一個提示 💡」
    if (btnMoreHint) {
      btnMoreHint.addEventListener("click", () => {
        if (invitationState.isDelivering) return;
        const curLetter = invitationState.letters[invitationState.activeId];
        if (curLetter.currentHintLevel < 3) {
          playTone(720);
          curLetter.currentHintLevel++;
          renderCurrentLetter();
        }
      });
    }

    // 「先挑戰其他邀請函 ↩」按鈕
    if (btnSwitchOther) {
      btnSwitchOther.addEventListener("click", () => {
        if (invitationState.isDelivering) return;
        playClickSFX();
        const nextId = getNextUndeliveredId(invitationState.activeId);
        if (nextId) {
          invitationState.activeId = nextId;
          renderCurrentLetter();
        }
      });
    }

    // 投遞判定邏輯（兼顧桌機拖曳與點擊投遞）
    function handleDeliverAttempt(chosenResident) {
      if (invitationState.isDelivering) return;

      const activeId = invitationState.activeId;
      const curLetter = invitationState.letters[activeId];
      if (curLetter.delivered) return;

      const curData = invitationCardsData.find(item => item.id === activeId);

      // 【判定 1：答對！】
      if (chosenResident === curData.target) {
        invitationState.isDelivering = true;
        curLetter.delivered = true;
        playTone(880);

        // 播放送達動畫（信件飛向居民家）
        playDeliveryAnimation(activeId, chosenResident, () => {
          // 更新居民住處狀態標記
          const zone = document.getElementById(`zone-${chosenResident}`);
          const badge = document.getElementById(`badge-${chosenResident}`);
          const statusText = document.getElementById(`status-text-${chosenResident}`);
          if (zone) zone.classList.add("delivered-done");
          if (badge) badge.classList.remove("hidden");
          if (statusText) statusText.textContent = "已送達 💌";

          // 解鎖頂部居民印章
          const stampSlot = document.getElementById(`stamp-slot-${chosenResident}`);
          const stampCheck = document.getElementById(`stamp-check-${chosenResident}`);
          if (stampSlot) stampSlot.classList.add("unlocked");
          if (stampCheck) stampCheck.classList.remove("hidden");

          // 更新進度
          let deliveredCount = 0;
          for (let i = 1; i <= 4; i++) {
            if (invitationState.letters[i].delivered) deliveredCount++;
          }
          if (progressText) progressText.textContent = `已送達 ${deliveredCount}／4`;

          // 更新信件標籤狀態
          renderCurrentLetter();

          // 開啟對應海洋知識卡彈窗
          if (knowledgeCheerImg) knowledgeCheerImg.src = curData.cheerImg;
          if (knowledgeTitle) knowledgeTitle.textContent = curData.knowledge.title;
          if (knowledgeBody) knowledgeBody.textContent = curData.knowledge.content;

          if (btnCloseKnowledge) {
            if (deliveredCount === 4) {
              btnCloseKnowledge.textContent = "收下印章，查看成果 ✨";
            } else {
              btnCloseKnowledge.textContent = "收下印章，繼續送信 ➔";
            }
          }

          if (knowledgeModal) knowledgeModal.classList.remove("hidden");
        });

      } else {
        // 【判定 2：答錯！】
        playClickSFX();
        const zone = document.getElementById(`zone-${chosenResident}`);
        if (zone) {
          zone.classList.remove("shake-error");
          void zone.offsetWidth;
          zone.classList.add("shake-error");
        }

        // 還有尚未出現的提示：自動推進到下一條提示
        if (curLetter.currentHintLevel < 3) {
          curLetter.currentHintLevel++;
          renderCurrentLetter();

          if (feedbackMsg && feedbackText && feedbackIcon) {
            feedbackIcon.textContent = "💡";
            feedbackText.textContent = "再想一想！新的線索來了，讀一讀後再試一次吧！";
            feedbackMsg.classList.remove("hidden");
          }
        } else {
          // 已顯示第三條提示：維持第三條，允許重試或先切換其他信件
          const remainingOthers = getRemainingUndeliveredCount() > 1;
          if (feedbackMsg && feedbackText && feedbackIcon) {
            feedbackIcon.textContent = "🔍";
            if (remainingOthers) {
              feedbackText.textContent = "再比對一下這條線索吧！你可以再試一次，也可以先挑戰其他邀請函。";
              if (btnSwitchOther) btnSwitchOther.classList.remove("hidden");
            } else {
              feedbackText.textContent = "再比對一下這條線索吧！你可以再試一次。";
              if (btnSwitchOther) btnSwitchOther.classList.add("hidden");
            }
            feedbackMsg.classList.remove("hidden");
          }
        }
      }
    }

    // 送信飛行動畫
    function playDeliveryAnimation(letterId, residentKey, onComplete) {
      if (!animOverlay || !flyingLetter) {
        if (onComplete) onComplete();
        return;
      }

      const envItem = document.getElementById("draggable-envelope");
      const targetZone = document.getElementById(`zone-${residentKey}`);
      if (!envItem || !targetZone) {
        if (onComplete) onComplete();
        return;
      }

      const stageRect = document.getElementById("invitation-map-stage").getBoundingClientRect();
      const startRect = envItem.getBoundingClientRect();
      const endRect = targetZone.getBoundingClientRect();

      const startX = startRect.left - stageRect.left + (startRect.width - 90) / 2;
      const startY = startRect.top - stageRect.top + (startRect.height - 68) / 2;
      const endX = endRect.left - stageRect.left + (endRect.width - 90) / 2;
      const endY = endRect.top - stageRect.top + (endRect.height - 68) / 2;

      flyingLetter.style.transform = `translate(${startX}px, ${startY}px) scale(1)`;
      flyingLetter.style.opacity = "1";
      animOverlay.classList.remove("hidden");

      requestAnimationFrame(() => {
        flyingLetter.style.transform = `translate(${endX}px, ${endY}px) scale(1.15) rotate(8deg)`;

        setTimeout(() => {
          ParticleFX.burst(endX + 45, endY + 34, "sparkle", 20);
          ParticleFX.burst(endX + 45, endY + 34, "bubble", 15);
          flyingLetter.style.opacity = "0";

          setTimeout(() => {
            animOverlay.classList.add("hidden");
            if (onComplete) onComplete();
          }, 250);
        }, 650);
      });
    }

    // 關閉知識卡按鈕
    if (btnCloseKnowledge) {
      btnCloseKnowledge.addEventListener("click", () => {
        playClickSFX();
        if (knowledgeModal) knowledgeModal.classList.add("hidden");

        // 檢查是否四封信全部完成
        let deliveredCount = 0;
        for (let i = 1; i <= 4; i++) {
          if (invitationState.letters[i].delivered) deliveredCount++;
        }

        if (deliveredCount === 4) {
          // 四封信全數完成，且最後一張知識卡關閉後，開啟關卡完成畫面
          playTone(987.77);
          const stageRect = document.getElementById("book-stage").getBoundingClientRect();
          ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "confetti", 40);
          ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "sparkle", 30);
          if (victoryModal) victoryModal.classList.remove("hidden");
        } else {
          // 自動切換到下一封未送達的邀請函
          const nextId = getNextUndeliveredId(invitationState.activeId);
          if (nextId) {
            invitationState.activeId = nextId;
            renderCurrentLetter();
          }
        }

        invitationState.isDelivering = false;
      });
    }

    // 居民住處：支援點選投遞
    document.querySelectorAll(".resident-zone").forEach(zone => {
      zone.addEventListener("click", () => {
        const target = zone.dataset.resident;
        handleDeliverAttempt(target);
      });

      // 支援鍵盤 Enter/Space 投遞
      zone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const target = zone.dataset.resident;
          handleDeliverAttempt(target);
        }
      });

      // HTML5 Drag & Drop 支援
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("drag-hover");
      });
      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-hover");
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("drag-hover");
        const target = zone.dataset.resident;
        handleDeliverAttempt(target);
      });
    });

    // 邀請函本體：支援拖曳
    if (draggableEnvelope) {
      draggableEnvelope.addEventListener("dragstart", (e) => {
        if (invitationState.isDelivering) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", invitationState.activeId);
      });
    }

    // 遊戲說明彈窗開關
    if (btnShowHelp) {
      btnShowHelp.addEventListener("click", () => {
        playClickSFX();
        if (helpModal) helpModal.classList.remove("hidden");
      });
    }
    if (btnCloseHelp) {
      btnCloseHelp.addEventListener("click", () => {
        playClickSFX();
        if (helpModal) helpModal.classList.add("hidden");
      });
    }

    // 重新回顧海洋知識卡
    function renderReviewCard(residentKey) {
      const data = invitationCardsData.find(item => item.target === residentKey);
      if (!data || !reviewDetail) return;
      reviewDetail.innerHTML = `
        <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 12px;">
          <img src="${data.cheerImg}" alt="${data.residentName}" style="width: 80px; height: 80px; object-fit: contain;">
          <div>
            <h4 style="margin: 0 0 4px 0; color: #0284c7; font-size: 18px;">${data.knowledge.title}</h4>
            <span style="font-size: 12px; color: #10b981; font-weight: 800;">已解鎖認證印章 ✓</span>
          </div>
        </div>
        <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #334155;">${data.knowledge.content}</p>
      `;
    }

    if (btnReviewCards) {
      btnReviewCards.addEventListener("click", () => {
        playClickSFX();
        renderReviewCard("crab");
        document.querySelectorAll(".review-tab-btn").forEach(btn => {
          btn.classList.toggle("active", btn.dataset.target === "crab");
        });
        if (reviewModal) reviewModal.classList.remove("hidden");
      });
    }

    document.querySelectorAll(".review-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        playClickSFX();
        document.querySelectorAll(".review-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderReviewCard(btn.dataset.target);
      });
    });

    if (btnCloseReview) {
      btnCloseReview.addEventListener("click", () => {
        playClickSFX();
        if (reviewModal) reviewModal.classList.add("hidden");
      });
    }

    // 繼續故事 ➔ 接回單元 5（原本下一頁）
    if (btnContinueStory) {
      btnContinueStory.addEventListener("click", () => {
        playClickSFX();
        if (victoryModal) victoryModal.classList.add("hidden");
        goToUnit(5);
      });
    }

    // 再玩一次重設第一關
    resetLevel1Invitations = function() {
      invitationState.activeId = 1;
      invitationState.isDelivering = false;
      for (let i = 1; i <= 4; i++) {
        invitationState.letters[i] = { currentHintLevel: 1, delivered: false };
      }

      // 重設居民住處
      document.querySelectorAll(".resident-zone").forEach(zone => {
        zone.classList.remove("delivered-done");
        const b = zone.querySelector(".resident-status-badge");
        if (b) b.classList.add("hidden");
        const s = zone.querySelector(".delivery-status-text");
        if (s) s.textContent = "等待投遞";
      });

      // 重設頂部印章
      document.querySelectorAll(".stamp-slot").forEach(slot => slot.classList.remove("unlocked"));
      document.querySelectorAll(".stamp-check").forEach(check => check.classList.add("hidden"));

      if (progressText) progressText.textContent = "已送達 0／4";

      if (victoryModal) victoryModal.classList.add("hidden");
      if (knowledgeModal) knowledgeModal.classList.add("hidden");
      if (helpModal) helpModal.classList.add("hidden");
      if (reviewModal) reviewModal.classList.add("hidden");
      if (introCard) introCard.classList.remove("hidden");

      renderCurrentLetter();
    };

    if (btnReplayGame) {
      btnReplayGame.addEventListener("click", () => {
        playClickSFX();
        resetLevel1Invitations();
      });
    }

    // 初始渲染
    renderCurrentLetter();
  }

  // ------------------------------------------
  // 【關卡 2・單元 6】打破刻板印象泡泡
  // ------------------------------------------
  let bubblesInited = false;
  let resetLevel2Bubbles = null;
  function initLevel2Bubbles() {
    if (bubblesInited) return;
    bubblesInited = true;

    // 題目資料庫
    const stereotypeQuestions = [
      {
        id: 1,
        topic: "🫧 刻板印象泡泡一",
        title: "顏色真的有性別嗎？",
        story: "「海豚寶寶最喜歡粉紅色，但有朋友說：『男生就應該喜歡藍色！』你會怎麼回應？」",
        options: [
          { key: "A", text: "A. 「對呀！粉紅色比較適合女生。」", correct: false },
          { key: "B", text: "B. 「每個人都可以喜歡自己喜歡的顏色！」", correct: true },
          { key: "C", text: "C. 「那海豚寶寶以後不要用粉紅色就好了。」", correct: false }
        ],
        correctFeedback: "太棒了！顏色沒有固定的性別，每個人都能選擇自己喜歡的顏色！",
        retryFeedback: "再想想看，如果別人規定你不能使用自己喜歡的顏色，你會有什麼感覺呢？"
      },
      {
        id: 2,
        topic: "🫧 刻板印象泡泡二",
        title: "個性一定要符合性別嗎？",
        story: "「小海馬有點害羞，不喜歡在大家面前說話。有居民說：『男生應該勇敢一點，不能這麼害羞！』你會怎麼回應？」",
        options: [
          { key: "A", text: "A. 「每個人的個性都不一樣，害羞也沒有關係。」", correct: true },
          { key: "B", text: "B. 「他應該趕快改掉害羞的個性。」", correct: false },
          { key: "C", text: "C. 「男生本來就應該比女生勇敢。」", correct: false }
        ],
        correctFeedback: "你發現了！勇敢與害羞都不是由性別決定的，每個人都能用自己的步調成長。",
        retryFeedback: "想一想：每個人的個性都相同嗎？我們是否應該只因為性別，就要求別人改變自己呢？"
      },
      {
        id: 3,
        topic: "🫧 刻板印象泡泡三",
        title: "婚禮一定要有新郎與新娘嗎？",
        story: "「亮亮與閃閃正在準備婚禮，螃蟹阿姨好奇地問：『那誰是新郎？誰是新娘？』你認為哪種回應比較尊重他們？」",
        options: [
          { key: "A", text: "A. 「一定要分出新郎和新娘，婚禮才完整。」", correct: false },
          { key: "B", text: "B. 「由我們幫他們決定誰要扮演哪個角色。」", correct: false },
          { key: "C", text: "C. 「可以先問問亮亮與閃閃想怎麼稱呼自己，不需要替他們決定。」", correct: true }
        ],
        correctFeedback: "沒錯！每段關係都值得被尊重，我們可以先了解當事人的想法，而不是替他們設定角色。",
        retryFeedback: "想一想：一場婚禮最重要的是固定的角色，還是彼此的心意與選擇呢？"
      }
    ];

    // DOM 元素快取
    const arena = document.getElementById("stereotype-bubbles-arena");
    const dimOverlay = document.getElementById("bubbles-dim-overlay");
    const counterDisplay = document.getElementById("bubble-burst-counter");
    const introCard = document.getElementById("bubbles-intro-card");
    const btnStartChallenge = document.getElementById("btn-start-bubble-challenge");

    // Modal 與情境題目元素
    const quizModal = document.getElementById("bubble-quiz-modal");
    const topicTag = document.getElementById("scenario-topic-tag");
    const titleEl = document.getElementById("scenario-title");
    const storyEl = document.getElementById("scenario-story");
    const optionsGrid = document.getElementById("scenario-options-grid");
    const feedbackPanel = document.getElementById("scenario-feedback-panel");
    const feedbackIcon = document.getElementById("feedback-icon");
    const feedbackText = document.getElementById("feedback-text");
    const btnBurstBubble = document.getElementById("btn-burst-bubble");
    const btnRetryBubble = document.getElementById("btn-retry-bubble");
    const btnCloseModal = document.getElementById("btn-close-bubble-card");

    // 結語獎勵 Modal 元素
    const victoryModal = document.getElementById("bubbles-victory-modal");
    const btnContinueStory = document.getElementById("btn-bubbles-continue-story");

    let currentActiveId = null;
    let isProcessing = false;

    // 階段 1：開始挑戰按鈕
    if (btnStartChallenge) {
      btnStartChallenge.addEventListener("click", () => {
        playClickSFX();
        introCard.classList.add("hidden");
      });
    }

    // 階段 2：點擊任意灰色泡泡
    document.querySelectorAll(".gray-stereotype-bubble").forEach(bubble => {
      bubble.addEventListener("click", () => {
        const id = parseInt(bubble.dataset.id);
        if (state.bubblesResolved.has(id) || isProcessing) return;
        openQuestionModal(id);
      });
    });

    function openQuestionModal(id) {
      currentActiveId = id;
      const q = stereotypeQuestions.find(item => item.id === id);
      if (!q) return;

      playClickSFX();

      // 舞台微淡化非選中泡泡
      arena.classList.add("focus-mode");
      document.querySelectorAll(".gray-stereotype-bubble").forEach(b => {
        b.classList.toggle("active-focus", parseInt(b.dataset.id) === id);
      });

      // 填入題目資料
      topicTag.textContent = q.topic;
      titleEl.textContent = q.title;
      storyEl.textContent = q.story;

      // 產生選項
      optionsGrid.innerHTML = "";
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "scenario-opt-btn";
        btn.textContent = opt.text;
        btn.addEventListener("click", () => handleSelectOption(opt, btn, q));
        optionsGrid.appendChild(btn);
      });

      // 重置回饋區（嚴格確保一開啟題卡時隱藏打破泡泡按鈕與回饋區）
      feedbackPanel.classList.add("hidden");
      btnBurstBubble.classList.add("hidden");
      btnRetryBubble.classList.add("hidden");

      quizModal.classList.remove("hidden");
    }

    function handleSelectOption(opt, btnEl, question) {
      if (isProcessing) return;

      const allBtns = optionsGrid.querySelectorAll(".scenario-opt-btn");
      allBtns.forEach(b => b.classList.remove("opt-selected-correct", "opt-selected-retry"));

      if (opt.correct) {
        // 當選擇合適的回答時，才出現「打破泡泡！ ✨」按鈕
        btnEl.classList.add("opt-selected-correct");
        allBtns.forEach(b => b.disabled = true);
        feedbackIcon.textContent = "🌟";
        feedbackText.textContent = question.correctFeedback;
        feedbackPanel.classList.remove("hidden");
        btnBurstBubble.classList.remove("hidden");
        btnRetryBubble.classList.add("hidden");
        playTone(880);
      } else {
        // 選擇其他回答時：引導深入思考，絕對不出現打破泡泡選項，僅提供再試一次
        btnEl.classList.add("opt-selected-retry");
        feedbackIcon.textContent = "💡";
        feedbackText.textContent = question.retryFeedback;
        feedbackPanel.classList.remove("hidden");
        btnBurstBubble.classList.add("hidden");
        btnRetryBubble.classList.remove("hidden");
        playClickSFX();
      }
    }

    // 再試一次按鈕
    btnRetryBubble.addEventListener("click", () => {
      playClickSFX();
      const allBtns = optionsGrid.querySelectorAll(".scenario-opt-btn");
      allBtns.forEach(b => {
        b.disabled = false;
        b.classList.remove("opt-selected-correct", "opt-selected-retry");
      });
      feedbackPanel.classList.add("hidden");
      btnBurstBubble.classList.add("hidden");
      btnRetryBubble.classList.add("hidden");
    });

    // 關閉題卡按鈕（未完成前退回海底）
    btnCloseModal.addEventListener("click", () => {
      playClickSFX();
      quizModal.classList.add("hidden");
      arena.classList.remove("focus-mode");
      document.querySelectorAll(".gray-stereotype-bubble").forEach(b => b.classList.remove("active-focus"));
    });

    // 階段 4：打破泡泡按鈕
    btnBurstBubble.addEventListener("click", () => {
      if (!currentActiveId || isProcessing) return;
      isProcessing = true;

      // 關閉題卡
      quizModal.classList.add("hidden");
      arena.classList.remove("focus-mode");

      const targetBubble = document.getElementById(`bubble-item-1`.replace('1', currentActiveId));
      if (!targetBubble) {
        isProcessing = false;
        return;
      }

      // 泡泡轉變成彩色
      targetBubble.classList.add("rainbow-active");

      setTimeout(() => {
        // 播放破裂動畫與粒子特效
        targetBubble.classList.add("bursting");

        const r = targetBubble.getBoundingClientRect();
        const stageRect = document.getElementById("book-stage").getBoundingClientRect();
        const cx = r.left - stageRect.left + r.width / 2;
        const cy = r.top - stageRect.top + r.height / 2;

        ParticleFX.burst(cx, cy, "bubble", 35);
        ParticleFX.burst(cx, cy, "confetti", 25);
        ParticleFX.burst(cx, cy, "sparkle", 20);

        playClickSFX();

        setTimeout(() => {
          // 泡泡消失並記錄
          targetBubble.classList.remove("bursting");
          targetBubble.classList.add("broken");
          state.bubblesResolved.add(currentActiveId);

          // 更新進度顯示
          counterDisplay.textContent = `已打破 ${state.bubblesResolved.size}／3 顆刻板印象泡泡`;

          // 前兩顆打破時，海底依然維持暗淡遮罩（刻板印象尚未全部消除）
          // 只有當三個泡泡全部打破時，才會完全恢復澄澈明亮！
          if (state.bubblesResolved.size < 3 && dimOverlay) {
            dimOverlay.style.opacity = "1";
          }

          isProcessing = false;

          // 階段 5：若三顆全部完成，觸發全場澄澈明亮與結語獎勵
          if (state.bubblesResolved.size === 3) {
            setTimeout(handleAllBubblesCompleted, 500);
          }
        }, 450);
      }, 350);
    });

    // 階段 5：三顆泡泡全部完成獎勵（海底完全恢復澄澈明亮，亮亮閃閃現身致謝）
    function handleAllBubblesCompleted() {
      // 三個泡泡都打破後，灰色遮罩完全淡出，海底徹底恢復澄澈明亮
      if (dimOverlay) {
        dimOverlay.style.opacity = "0";
      }

      const stageRect = document.getElementById("book-stage").getBoundingClientRect();
      ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "confetti", 45);
      ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "sparkle", 35);
      ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "bubble", 35);

      playTone(987.77);

      // 亮亮閃閃現身，浮現「完成挑戰，繼續故事」選項
      setTimeout(() => {
        victoryModal.classList.remove("hidden");
      }, 500);
    }

    // 完成挑戰，繼續故事按鈕
    if (btnContinueStory) {
      btnContinueStory.addEventListener("click", () => {
        playClickSFX();
        victoryModal.classList.add("hidden");
        goToUnit(7);
      });
    }

    // 重置第二關狀態（供重新進入單元 6 時使用）
    resetLevel2Bubbles = function() {
      state.bubblesResolved.clear();
      isProcessing = false;
      currentActiveId = null;
      if (dimOverlay) dimOverlay.style.opacity = "1";
      if (counterDisplay) counterDisplay.textContent = "已打破 0／3 顆刻板印象泡泡";
      if (introCard) introCard.classList.remove("hidden");
      if (arena) arena.classList.remove("focus-mode");
      if (quizModal) quizModal.classList.add("hidden");
      if (victoryModal) victoryModal.classList.add("hidden");
      if (feedbackPanel) feedbackPanel.classList.add("hidden");
      if (btnBurstBubble) btnBurstBubble.classList.add("hidden");
      if (btnRetryBubble) btnRetryBubble.classList.add("hidden");

      document.querySelectorAll(".gray-stereotype-bubble").forEach(b => {
        b.className = `gray-stereotype-bubble bubble-item-${b.dataset.id}`;
        b.style.display = "";
        const badge = b.querySelector(".bubble-check-badge");
        if (badge) badge.classList.add("hidden");
      });
    };
  }

  // ------------------------------------------
  // 【關卡 3・單元 8】波光城婚禮造型設計師
  // ------------------------------------------
  let salonInited = false;

  // 12 件配件完整資料庫（路徑指向 images/accessories/）
  const wardrobeData = {
    hats: [
      { id: "hat-01", name: "婚禮禮帽", file: "01_婚禮禮帽.png", slot: "hat", extraClass: "" },
      { id: "hat-02", name: "花朵頭飾", file: "02_花朵頭飾.png", slot: "hat", extraClass: "style-flower" },
      { id: "hat-03", name: "海星髮飾", file: "03_海星髮飾.png", slot: "hat", extraClass: "style-starfish" }
    ],
    veils: [
      { id: "veil-04", name: "白色婚禮頭紗", file: "04_白色婚禮頭紗.png", slot: "veil", extraClass: "" },
      { id: "veil-05", name: "珊瑚粉頭紗", file: "05_珊瑚粉頭紗.png", slot: "veil", extraClass: "" },
      { id: "veil-06", name: "海洋藍頭紗", file: "06_海洋藍頭紗.png", slot: "veil", extraClass: "" }
    ],
    gowns: [
      { id: "gown-07", name: "白色婚禮禮服", file: "07_白色婚禮禮服.png", slot: "clothing", extraClass: "" },
      { id: "gown-08", name: "粉紅色婚禮禮服", file: "08_粉紅色婚禮禮服.png", slot: "clothing", extraClass: "" },
      { id: "gown-09", name: "海洋藍婚禮禮服", file: "09_海洋藍婚禮禮服.png", slot: "clothing", extraClass: "" }
    ],
    suits: [
      { id: "suit-10", name: "經典白色西裝", file: "10_經典白色西裝.png", slot: "clothing", extraClass: "" },
      { id: "suit-11", name: "珊瑚粉西裝", file: "11_珊瑚粉西裝.png", slot: "clothing", extraClass: "" },
      { id: "suit-12", name: "深海藍西裝", file: "12_深海藍西裝.png", slot: "clothing", extraClass: "" }
    ]
  };

  // 角色各自獨立的穿戴狀態機
  const salonState = {
    activeChar: "liang", // "liang" 或 "shan"
    liang: { hat: null, veil: null, clothing: null },
    shan: { hat: null, veil: null, clothing: null }
  };

  const residentCheers = [
    { avatar: "🐙", name: "章魚裁縫師", text: "「每一件禮服與西裝，都是為自由的心情剪裁的！怎麼搭都帥氣又美麗！」" },
    { avatar: "🦀", name: "螃蟹阿姨", text: "「大螯比讚！不管是禮服還是西裝，穿出自己的自信最閃亮！」" },
    { avatar: "🪼", name: "老水母", text: "「智慧的選擇！大自然的美麗從不設限，這就是波光城的溫柔。」" },
    { avatar: "🐠", name: "小丑魚群", text: "「太酷了！誰說粉紅色不能穿西裝、藍色不能戴頭紗？超有型！」" },
    { avatar: "🎠", name: "海馬郵差", text: "「太棒的婚禮穿搭！我要趕快把這份喜悅送到全海洋每一個角落！」" },
    { avatar: "🐬", name: "海豚寶寶", text: "「酷斃了！波光城最閃亮、最特別的一對！翻個跟斗為你們歡呼！」" }
  ];

  function updateResidentCheer() {
    const cheer = residentCheers[Math.floor(Math.random() * residentCheers.length)];
    const avatarEl = document.getElementById("cheer-avatar");
    const speakerEl = document.getElementById("cheer-speaker");
    const textEl = document.getElementById("cheer-text");
    if (avatarEl) avatarEl.textContent = cheer.avatar;
    if (speakerEl) speakerEl.textContent = cheer.name;
    if (textEl) textEl.textContent = cheer.text;
  }

  function initLevel3Salon() {
    if (salonInited) return;
    salonInited = true;

    const introCard = document.getElementById("salon-intro-card");
    const btnStartSalon = document.getElementById("btn-start-salon-challenge");
    const wardrobeItems = document.getElementById("wardrobe-items");
    const tabs = document.querySelectorAll(".wardrobe-tabs .tab-btn");
    const btnSwitchLiang = document.getElementById("btn-switch-liang");
    const btnSwitchShan = document.getElementById("btn-switch-shan");
    const podLiang = document.getElementById("pod-liang");
    const podShan = document.getElementById("pod-shan");
    const btnClearChar = document.getElementById("btn-clear-char-outfit");
    const btnResetAll = document.getElementById("btn-reset-all-outfits");
    const btnFinish = document.getElementById("btn-finish-outfit");
    const popup = document.getElementById("salon-popup");
    const btnRedo = document.getElementById("btn-redo-outfit");
    const btnDownloadPhoto = document.getElementById("btn-download-photo");
    const btnClosePopup = document.getElementById("btn-close-salon-popup");

    let currentCategory = "hats";

    // 關卡 3 說明彈窗：點擊「開始設計造型」進入換裝
    if (btnStartSalon) {
      btnStartSalon.addEventListener("click", () => {
        playClickSFX();
        if (introCard) introCard.classList.add("hidden");
      });
    }

    // 切換當前裝扮主角
    function setActiveCharacter(charName) {
      salonState.activeChar = charName;
      if (btnSwitchLiang) btnSwitchLiang.classList.toggle("active", charName === "liang");
      if (btnSwitchShan) btnSwitchShan.classList.toggle("active", charName === "shan");
      if (podLiang) {
        podLiang.classList.toggle("active-char", charName === "liang");
        const b = podLiang.querySelector(".char-status-badge");
        if (b) b.classList.toggle("hidden", charName !== "liang");
      }
      if (podShan) {
        podShan.classList.toggle("active-char", charName === "shan");
        const b = podShan.querySelector(".char-status-badge");
        if (b) b.classList.toggle("hidden", charName !== "shan");
      }
      renderWardrobe(currentCategory);
    }

    if (btnSwitchLiang) btnSwitchLiang.addEventListener("click", () => { playClickSFX(); setActiveCharacter("liang"); });
    if (btnSwitchShan) btnSwitchShan.addEventListener("click", () => { playClickSFX(); setActiveCharacter("shan"); });
    if (podLiang) podLiang.addEventListener("click", () => { playClickSFX(); setActiveCharacter("liang"); });
    if (podShan) podShan.addEventListener("click", () => { playClickSFX(); setActiveCharacter("shan"); });

    // 更新角色舞台上的配件圖層顯示
    function updateCharacterVisual(charName) {
      const outfit = salonState[charName];
      const veilLayer = document.getElementById(`layer-${charName}-veil`);
      const clothLayer = document.getElementById(`layer-${charName}-clothing`);
      const hatLayer = document.getElementById(`layer-${charName}-hat`);
      const summaryText = document.getElementById(`${charName}-outfit-text`);

      // 1. 頭紗
      if (veilLayer) {
        if (outfit.veil) {
          veilLayer.src = `images/accessories/${outfit.veil.file}`;
          veilLayer.className = `acc-layer layer-veil ${outfit.veil.extraClass || ""}`;
          veilLayer.classList.remove("hidden");
        } else {
          veilLayer.classList.add("hidden");
          veilLayer.src = "";
        }
      }

      // 2. 服裝（禮服或西裝，互斥替換）
      if (clothLayer) {
        if (outfit.clothing) {
          clothLayer.src = `images/accessories/${outfit.clothing.file}`;
          clothLayer.className = `acc-layer layer-clothing ${outfit.clothing.extraClass || ""}`;
          clothLayer.classList.remove("hidden");
        } else {
          clothLayer.classList.add("hidden");
          clothLayer.src = "";
        }
      }

      // 3. 帽飾
      if (hatLayer) {
        if (outfit.hat) {
          hatLayer.src = `images/accessories/${outfit.hat.file}`;
          hatLayer.className = `acc-layer layer-hat ${outfit.hat.extraClass || ""}`;
          hatLayer.classList.remove("hidden");
        } else {
          hatLayer.classList.add("hidden");
          hatLayer.src = "";
        }
      }

      // 同步全域相容狀態
      state[`${charName}Outfit`] = {
        hat: outfit.hat ? outfit.hat.name : null,
        cloth: outfit.clothing ? outfit.clothing.name : null
      };

      // 更新穿搭字卡
      if (summaryText) {
        const parts = [];
        if (outfit.hat) parts.push(outfit.hat.name);
        if (outfit.veil) parts.push(outfit.veil.name);
        if (outfit.clothing) parts.push(outfit.clothing.name);
        summaryText.textContent = parts.length > 0 ? parts.join(" ＋ ") : "原本自信的自己";
      }
    }

    // 穿戴或卸下配件
    function toggleEquipItem(item) {
      const charName = salonState.activeChar;
      const slot = item.slot;
      const currentEquipped = salonState[charName][slot];

      if (currentEquipped && currentEquipped.id === item.id) {
        // 再次點擊已穿戴配件：卸下取消
        salonState[charName][slot] = null;
        playClickSFX();
      } else {
        // 穿戴新配件（同 slot 自動替換）
        salonState[charName][slot] = item;
        playTone(740);

        // 觸發角色走秀旋轉動畫與魔法星光
        const stageBox = document.getElementById(`avatar-stage-${charName}`);
        if (stageBox) {
          stageBox.classList.remove("spinning");
          void stageBox.offsetWidth;
          stageBox.classList.add("spinning");
          setTimeout(() => stageBox.classList.remove("spinning"), 750);

          const r = stageBox.getBoundingClientRect();
          const bookStage = document.getElementById("book-stage").getBoundingClientRect();
          ParticleFX.burst(r.left - bookStage.left + r.width / 2, r.top - bookStage.top + r.height / 2, "sparkle", 16);
        }
      }

      updateCharacterVisual(charName);
      updateResidentCheer();
      renderWardrobe(currentCategory);
    }

    // 卸下目前分類的配件
    function unequipCategory(cat) {
      const charName = salonState.activeChar;
      if (cat === "hats") salonState[charName].hat = null;
      else if (cat === "veils") salonState[charName].veil = null;
      else if (cat === "gowns" || cat === "suits") salonState[charName].clothing = null;

      playClickSFX();
      updateCharacterVisual(charName);
      renderWardrobe(currentCategory);
    }

    // 渲染配件選單
    function renderWardrobe(cat) {
      if (!wardrobeItems) return;
      wardrobeItems.innerHTML = "";
      const charName = salonState.activeChar;
      const currentOutfit = salonState[charName];

      const list = wardrobeData[cat] || [];
      list.forEach(item => {
        const isEquipped = currentOutfit[item.slot] && currentOutfit[item.slot].id === item.id;
        const card = document.createElement("div");
        card.className = `cloth-item-card ${isEquipped ? "active-equipped" : ""}`;
        card.innerHTML = `
          <img src="images/accessories/${item.file}" alt="${item.name}" class="cloth-item-thumb">
          <span class="name">${item.name}</span>
        `;
        card.addEventListener("click", () => toggleEquipItem(item));
        wardrobeItems.appendChild(card);
      });

      // 新增「卸下此類別」按鈕
      const unequipCard = document.createElement("div");
      unequipCard.className = "cloth-item-card card-unequip";
      unequipCard.innerHTML = `
        <span class="unequip-icon">✕</span>
        <span class="name">不穿戴此類</span>
      `;
      unequipCard.addEventListener("click", () => unequipCategory(cat));
      wardrobeItems.appendChild(unequipCard);
    }

    // 分頁切換
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        playClickSFX();
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.tab;
        renderWardrobe(currentCategory);
      });
    });

    // 清除目前角色配件
    if (btnClearChar) {
      btnClearChar.addEventListener("click", () => {
        playClickSFX();
        const c = salonState.activeChar;
        salonState[c] = { hat: null, veil: null, clothing: null };
        updateCharacterVisual(c);
        renderWardrobe(currentCategory);
      });
    }

    // 全部重設
    if (btnResetAll) {
      btnResetAll.addEventListener("click", () => {
        playClickSFX();
        salonState.liang = { hat: null, veil: null, clothing: null };
        salonState.shan = { hat: null, veil: null, clothing: null };
        updateCharacterVisual("liang");
        updateCharacterVisual("shan");
        renderWardrobe(currentCategory);
      });
    }

    // 完成造型：打開成果彈窗並同步雙主角裝扮
    function openVictoryModal() {
      playTone(880);
      const stageRect = document.getElementById("book-stage").getBoundingClientRect();
      ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "confetti", 30);
      ParticleFX.burst(stageRect.width / 2, stageRect.height / 2, "sparkle", 25);

      // 同步成果展台的亮亮
      const vLiangVeil = document.getElementById("v-layer-liang-veil");
      const vLiangCloth = document.getElementById("v-layer-liang-clothing");
      const vLiangHat = document.getElementById("v-layer-liang-hat");
      if (salonState.liang.veil) {
        vLiangVeil.src = `images/accessories/${salonState.liang.veil.file}`;
        vLiangVeil.className = `acc-layer layer-veil ${salonState.liang.veil.extraClass || ""}`;
        vLiangVeil.classList.remove("hidden");
      } else { vLiangVeil.classList.add("hidden"); }

      if (salonState.liang.clothing) {
        vLiangCloth.src = `images/accessories/${salonState.liang.clothing.file}`;
        vLiangCloth.className = `acc-layer layer-clothing ${salonState.liang.clothing.extraClass || ""}`;
        vLiangCloth.classList.remove("hidden");
      } else { vLiangCloth.classList.add("hidden"); }

      if (salonState.liang.hat) {
        vLiangHat.src = `images/accessories/${salonState.liang.hat.file}`;
        vLiangHat.className = `acc-layer layer-hat ${salonState.liang.hat.extraClass || ""}`;
        vLiangHat.classList.remove("hidden");
      } else { vLiangHat.classList.add("hidden"); }

      // 同步成果展台的閃閃
      const vShanVeil = document.getElementById("v-layer-shan-veil");
      const vShanCloth = document.getElementById("v-layer-shan-clothing");
      const vShanHat = document.getElementById("v-layer-shan-hat");
      if (salonState.shan.veil) {
        vShanVeil.src = `images/accessories/${salonState.shan.veil.file}`;
        vShanVeil.className = `acc-layer layer-veil ${salonState.shan.veil.extraClass || ""}`;
        vShanVeil.classList.remove("hidden");
      } else { vShanVeil.classList.add("hidden"); }

      if (salonState.shan.clothing) {
        vShanCloth.src = `images/accessories/${salonState.shan.clothing.file}`;
        vShanCloth.className = `acc-layer layer-clothing ${salonState.shan.clothing.extraClass || ""}`;
        vShanCloth.classList.remove("hidden");
      } else { vShanCloth.classList.add("hidden"); }

      if (salonState.shan.hat) {
        vShanHat.src = `images/accessories/${salonState.shan.hat.file}`;
        vShanHat.className = `acc-layer layer-hat ${salonState.shan.hat.extraClass || ""}`;
        vShanHat.classList.remove("hidden");
      } else { vShanHat.classList.add("hidden"); }

      if (popup) popup.classList.remove("hidden");
    }

    if (btnFinish) btnFinish.addEventListener("click", openVictoryModal);

    // 重新搭配
    if (btnRedo) {
      btnRedo.addEventListener("click", () => {
        playClickSFX();
        if (popup) popup.classList.add("hidden");
      });
    }

    // 繼續故事 ➔ 前往單元 9
    if (btnClosePopup) {
      btnClosePopup.addEventListener("click", () => {
        playClickSFX();
        if (popup) popup.classList.add("hidden");
        goToUnit(9);
      });
    }

    // 拍下紀念照（純前端 Canvas 合成下載，完全防範 CORS）
    if (btnDownloadPhoto) {
      btnDownloadPhoto.addEventListener("click", () => {
        playTone(987.77);
        generateVictoryPhotoDownload();
      });
    }

    function generateVictoryPhotoDownload() {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");

      // 1. 繪製童話海洋背景
      const grad = ctx.createLinearGradient(0, 0, 0, 900);
      grad.addColorStop(0, "#0369a1");
      grad.addColorStop(0.5, "#0284c7");
      grad.addColorStop(1, "#075985");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 900);

      // 海底光影與柔和光斑
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const bx = Math.random() * 1200;
        const by = Math.random() * 900;
        const br = 6 + Math.random() * 24;
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + Math.random() * 0.18})`;
        ctx.fill();
      }

      // 2. 標題與金句
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px 'PingFang TC', 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ 波光城夢幻婚禮造型紀念照 ✨", 600, 75);

      ctx.fillStyle = "#fde047";
      ctx.font = "bold 26px 'PingFang TC', 'Microsoft JhengHei', sans-serif";
      ctx.fillText("「每個人都可以自由選擇自己喜歡的模樣！」", 600, 125);

      // 3. 異步載入雙角色與配件並合成繪製
      function loadImg(src) {
        return new Promise((resolve, reject) => {
          if (!src) return resolve(null);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      }

      const tasks = [
        loadImg("images/liang_base.png"),
        loadImg("images/shan_base.png"),
        loadImg(salonState.liang.veil ? `images/accessories/${salonState.liang.veil.file}` : null),
        loadImg(salonState.liang.clothing ? `images/accessories/${salonState.liang.clothing.file}` : null),
        loadImg(salonState.liang.hat ? `images/accessories/${salonState.liang.hat.file}` : null),
        loadImg(salonState.shan.veil ? `images/accessories/${salonState.shan.veil.file}` : null),
        loadImg(salonState.shan.clothing ? `images/accessories/${salonState.shan.clothing.file}` : null),
        loadImg(salonState.shan.hat ? `images/accessories/${salonState.shan.hat.file}` : null)
      ];

      Promise.all(tasks).then(([
        imgLiangBase, imgShanBase,
        lVeil, lCloth, lHat,
        sVeil, sCloth, sHat
      ]) => {
        const cw = 440;
        const ch = Math.round(cw * (4 / 3)); // 586
        const cy = 175;

        // 繪製亮亮（左側：X = 130）
        const lx = 130;
        if (imgLiangBase) {
          ctx.save();
          // 圓角畫布裁剪
          ctx.beginPath();
          ctx.roundRect(lx, cy, cw, ch, 24);
          ctx.clip();
          ctx.drawImage(imgLiangBase, lx, cy, cw, ch);

          // 亮亮配件
          if (lVeil) {
            const vw = cw * 0.58;
            const vh = lVeil.height * (vw / lVeil.width);
            ctx.drawImage(lVeil, lx + (cw - vw) / 2, cy + ch * 0.17, vw, vh);
          }
          if (lCloth) {
            const clw = cw * 0.60;
            const clh = lCloth.height * (clw / lCloth.width);
            ctx.drawImage(lCloth, lx + (cw - clw) / 2, cy + ch * 0.50, clw, clh);
          }
          if (lHat) {
            const isStar = salonState.liang.hat.id === "hat-03";
            const isFlower = salonState.liang.hat.id === "hat-02";
            const hw = isStar ? cw * 0.18 : (isFlower ? cw * 0.36 : cw * 0.36);
            const hh = lHat.height * (hw / lHat.width);
            const hx = isStar ? lx + cw * 0.58 : lx + (cw - hw) / 2;
            const hy = isStar ? cy + ch * 0.17 : (isFlower ? cy + ch * 0.18 : cy + ch * 0.11);
            ctx.drawImage(lHat, hx, hy, hw, hh);
          }
          ctx.restore();

          // 角色標籤外框
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(lx, cy, cw, ch, 24);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 26px sans-serif";
          ctx.fillText("亮亮", lx + cw / 2, cy + ch + 45);
        }

        // 繪製閃閃（右側：X = 630）
        const sx = 630;
        if (imgShanBase) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(sx, cy, cw, ch, 24);
          ctx.clip();
          ctx.drawImage(imgShanBase, sx, cy, cw, ch);

          // 閃閃配件
          if (sVeil) {
            const vw = cw * 0.58;
            const vh = sVeil.height * (vw / sVeil.width);
            ctx.drawImage(sVeil, sx + (cw - vw) / 2, cy + ch * 0.17, vw, vh);
          }
          if (sCloth) {
            const clw = cw * 0.60;
            const clh = sCloth.height * (clw / sCloth.width);
            ctx.drawImage(sCloth, sx + (cw - clw) / 2, cy + ch * 0.50, clw, clh);
          }
          if (sHat) {
            const isStar = salonState.shan.hat.id === "hat-03";
            const isFlower = salonState.shan.hat.id === "hat-02";
            const hw = isStar ? cw * 0.18 : (isFlower ? cw * 0.36 : cw * 0.36);
            const hh = sHat.height * (hw / sHat.width);
            const hx = isStar ? sx + cw * 0.58 : sx + (cw - hw) / 2;
            const hy = isStar ? cy + ch * 0.17 : (isFlower ? cy + ch * 0.18 : cy + ch * 0.11);
            ctx.drawImage(sHat, hx, hy, hw, hh);
          }
          ctx.restore();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(sx, cy, cw, ch, 24);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 26px sans-serif";
          ctx.fillText("閃閃", sx + cw / 2, cy + ch + 45);
        }

        // 中央愛心符號
        ctx.font = "48px sans-serif";
        ctx.fillText("💖", 600, cy + ch / 2);

        // 底部版權與落款
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.font = "16px sans-serif";
        ctx.fillText("《海蛞蝓愛海蛞蝓》・波光城婚禮造型設計師", 600, 865);

        // 觸發圖片自動下載
        const link = document.createElement("a");
        link.download = "波光城婚禮造型紀念照.png";
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(err => {
        console.error("生成紀念照失敗:", err);
      });
    }

    // 初始化渲染
    updateCharacterVisual("liang");
    updateCharacterVisual("shan");
    renderWardrobe("hats");
  }

  // ------------------------------------------
  // 【關卡 4・單元 10】波光交響布置
  // ------------------------------------------
  let decoInited = false;
  function initLevel4StageDeco() {
    if (decoInited) return;
    decoInited = true;

    const fillBar = document.getElementById("harmony-fill");
    const pctLabel = document.getElementById("harmony-percentage");
    const toast = document.getElementById("toast-wedding-ready");

    function addHarmony(amount) {
      state.harmonyScore = Math.min(100, state.harmonyScore + amount);
      fillBar.style.width = `${state.harmonyScore}%`;
      pctLabel.textContent = `${state.harmonyScore}%`;

      if (state.harmonyScore >= 100) {
        toast.classList.remove("hidden");
        playTone(987.77); // B5
      }
    }

    function pulseDecoNode(node) {
      node.classList.remove("beating");
      void node.offsetWidth;
      node.classList.add("beating");
      const r = node.getBoundingClientRect();
      const sRect = document.getElementById("book-stage").getBoundingClientRect();
      ParticleFX.burst(r.left - sRect.left + r.width / 2, r.top - sRect.top + r.height / 2, "sparkle", 14);
      setTimeout(() => node.classList.remove("beating"), 400);
    }

    document.getElementById("node-lights").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#fef08a";
      pulseDecoNode(e.currentTarget);
      playTone(587.33);
      addHarmony(30);
    });

    document.getElementById("node-music").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#fed7aa";
      pulseDecoNode(e.currentTarget);
      playTone(659.25);
      addHarmony(30);
    });

    document.getElementById("node-carpet").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#a7f3d0";
      pulseDecoNode(e.currentTarget);
      playTone(783.99);
      addHarmony(20);
    });

    // 伴舞小魚群點擊互動
    document.querySelectorAll(".groove-fish").forEach(fish => {
      fish.addEventListener("click", (e) => {
        e.stopPropagation();
        playClickSFX();
        const r = fish.getBoundingClientRect();
        const sRect = document.getElementById("book-stage").getBoundingClientRect();
        ParticleFX.burst(r.left - sRect.left + r.width / 2, r.top - sRect.top + r.height / 2, "bubble", 15);
      });
    });
  }

  // ------------------------------------------
  // 【關卡 5・單元 11】編織愛之環連線
  // ------------------------------------------
  let weaveInited = false;
  function initLevel5Weave() {
    if (weaveInited) return;
    weaveInited = true;

    const canvas = document.getElementById("weave-canvas");
    const ctx = canvas.getContext("2d");
    const statusBar = document.getElementById("weave-status");

    const points = [
      { x: 140, y: 190, label: "傾聽", reached: false },
      { x: 400, y: 110, label: "尊重", reached: false },
      { x: 660, y: 190, label: "相伴", reached: false }
    ];

    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(125, 211, 252, 0.25)";
      ctx.beginPath();
      ctx.ellipse(300, 230, 160, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(249, 168, 212, 0.25)";
      ctx.beginPath();
      ctx.ellipse(500, 230, 160, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.quadraticCurveTo(400, 80, points[2].x, points[2].y);
      ctx.stroke();
      ctx.setLineDash([]);

      points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.reached ? 15 : 10, 0, Math.PI * 2);
        ctx.fillStyle = pt.reached ? "#f59e0b" : "rgba(255,255,255,0.8)";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = pt.reached ? 16 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff";
        ctx.font = "bold 15px 'Noto Sans TC'";
        ctx.textAlign = "center";
        ctx.fillText(pt.label, pt.x, pt.y + 34);
      });
    }

    drawScene();

    let isDrawing = false;
    canvas.addEventListener("mousedown", () => isDrawing = true);
    window.addEventListener("mouseup", () => isDrawing = false);

    canvas.addEventListener("mousemove", (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      points.forEach((pt, index) => {
        const dist = Math.hypot(x - pt.x, y - pt.y);
        if (dist < 36 && !pt.reached) {
          pt.reached = true;
          state.weavePointsPassed++;
          document.getElementById(`vow-${index + 1}`).classList.add("unlocked");
          playTone(500 + index * 150);
          drawScene();

          if (state.weavePointsPassed === 3) {
            statusBar.innerHTML = "✨ <strong>愛之環編織完成！</strong>亮亮與閃閃套上了象徵永恆承諾的光芒！";
            playTone(880, "triangle", 0.8);
          } else {
            statusBar.textContent = `已解鎖第 ${state.weavePointsPassed} 道誓約！`;
          }
        }
      });
    });
  }

  // ------------------------------------------
  // 【單元 12】彩虹泡泡煙火點擊
  // ------------------------------------------
  function initUnit12Fireworks() {
    const zone = document.getElementById("fireworks-canvas-zone");
    if (!zone || zone.dataset.fireworksInited) return;
    zone.dataset.fireworksInited = "true";

    zone.addEventListener("click", (e) => {
      // 避免點擊文字時觸發
      if (e.target.closest(".floating-text-box")) return;
      createBubbleParticle(e.clientX, e.clientY);
      playTone(700 + Math.random() * 400, "sine", 0.2);
    });
  }

  function createBubbleParticle(x, y) {
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement("div");
      bubble.style.position = "fixed";
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.width = `${16 + Math.random() * 24}px`;
      bubble.style.height = bubble.style.width;
      bubble.style.borderRadius = "50%";
      bubble.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${['#38bdf8','#f472b6','#facc15','#4ade80'][Math.floor(Math.random()*4)]})`;
      bubble.style.boxShadow = "0 0 10px rgba(255,255,255,0.8)";
      bubble.style.pointerEvents = "none";
      bubble.style.zIndex = "999";
      bubble.style.transition = "all 0.8s ease-out";
      document.body.appendChild(bubble);

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 80;
      setTimeout(() => {
        bubble.style.transform = `translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance - 50}px) scale(0)`;
        bubble.style.opacity = "0";
      }, 20);

      setTimeout(() => bubble.remove(), 850);
    }
  }

  // ------------------------------------------
  // 【關卡 6・單元 13】小海兔星空手帳與證書
  // ------------------------------------------
  let reflectionInited = false;
  function initLevel6Reflection() {
    if (reflectionInited) return;
    reflectionInited = true;

    const optBtns = document.querySelectorAll(".quiz-options .btn-opt");
    const quizMsg = document.getElementById("quiz-msg");
    optBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        optBtns.forEach(b => b.classList.remove("selected-correct"));
        const isCorrect = btn.dataset.correct === "true";
        if (isCorrect) {
          btn.classList.add("selected-correct");
          quizMsg.textContent = "🌟 太棒了！你的回答溫暖而堅定，尊重每個人獨一無二的喜好！";
          quizMsg.classList.remove("hidden");
          quizMsg.style.color = "#166534";
          playTone(660);
        } else {
          quizMsg.textContent = "💡 想一想，如果是波光城的小海兔，會怎麼溫柔回應呢？再試試看！";
          quizMsg.classList.remove("hidden");
          quizMsg.style.color = "#991b1b";
        }
      });
    });

    const stampBtns = document.querySelectorAll(".stamp-btn");
    const stampCountDisplay = document.getElementById("stamp-selected-count");
    stampBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const stamp = btn.dataset.stamp;
        if (state.selectedStamps.has(stamp)) {
          state.selectedStamps.delete(stamp);
          btn.classList.remove("selected");
        } else {
          if (state.selectedStamps.size >= 3) {
            alert("最多挑選 3 枚印章喔！可以點擊取消其他印章進行更換。");
            return;
          }
          state.selectedStamps.add(stamp);
          btn.classList.add("selected");
          playTone(750);
        }
        stampCountDisplay.textContent = state.selectedStamps.size;
      });
    });

    const btnCreateCert = document.getElementById("btn-create-cert");
    const certModal = document.getElementById("cert-modal");
    const btnCloseCert = document.getElementById("btn-close-cert");
    const btnDownloadCert = document.getElementById("btn-download-cert");
    const certCanvas = document.getElementById("cert-canvas");

    btnCreateCert.addEventListener("click", () => {
      const codeInput = document.getElementById("student-code").value.trim();
      if (!codeInput) {
        alert("請輸入您的班級座號（例如：50101）以生成證書！");
        return;
      }
      if (state.selectedStamps.size === 0) {
        alert("請至少選擇 1 枚守護印章喔！");
        return;
      }

      state.studentCode = codeInput;
      drawCertificate(certCanvas, state.studentCode, Array.from(state.selectedStamps));
      certModal.classList.remove("hidden");
      playTone(880);
    });

    btnCloseCert.addEventListener("click", () => {
      certModal.classList.add("hidden");
    });

    btnDownloadCert.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = `波光城友善公民證書_${state.studentCode}.png`;
      link.href = certCanvas.toDataURL("image/png");
      link.click();
    });
  }

  function drawCertificate(canvas, studentCode, stamps) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fffcf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = "#f472b6";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

    ctx.fillStyle = "#854d0e";
    ctx.font = "bold 20px 'Noto Sans TC'";
    ctx.textAlign = "center";
    ctx.fillText("【性別平等・多元理解繪本】", canvas.width / 2, 80);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 34px 'Noto Sans TC'";
    ctx.fillText("波光城多元友善小衛士・榮譽證書", canvas.width / 2, 130);

    ctx.fillStyle = "#334155";
    ctx.font = "18px 'Noto Sans TC'";
    ctx.fillText(`茲證明 同學【代號：${studentCode}】`, canvas.width / 2, 185);
    ctx.fillText("成功完成《海蛞蝓愛海蛞蝓：波光城最閃亮的婚禮》全書探索與反思挑戰，", canvas.width / 2, 220);
    ctx.fillText("展現了同理傾聽、打破刻板印象與尊重多元差異的美好特質！", canvas.width / 2, 250);

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 16px 'Noto Sans TC'";
    ctx.fillText("—— 個人專屬守護印章 ——", canvas.width / 2, 305);

    const startX = canvas.width / 2 - ((stamps.length - 1) * 85);
    stamps.forEach((stamp, i) => {
      const cx = startX + i * 170;
      const cy = 370;

      ctx.beginPath();
      ctx.arc(cx, cy, 48, 0, Math.PI * 2);
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 15px 'Noto Sans TC'";
      ctx.fillText(stamp, cx, cy + 5);
    });

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px 'Noto Sans TC'";
    ctx.fillText("波光城小學・海蛞蝓老師 亮亮 & 閃閃 敬頒", canvas.width / 2, 480);
    ctx.fillText("「真正的愛，是讓彼此都能發出最自在、最獨特的光。」", canvas.width / 2, 510);
  }

  // ==========================================
  // 7. 全書隱藏彩蛋互動系統 (Easter Eggs)
  // ==========================================
  function initEasterEggs() {
    const hotspots = document.querySelectorAll(".easter-egg-hotspot");
    hotspots.forEach(egg => {
      egg.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = egg.dataset.egg;
        egg.classList.remove("egg-triggered");
        void egg.offsetWidth;
        egg.classList.add("egg-triggered");

        playClickSFX();

        const r = egg.getBoundingClientRect();
        const sRect = document.getElementById("book-stage").getBoundingClientRect();
        const x = r.left - sRect.left + r.width / 2;
        const y = r.top - sRect.top + r.height / 2;

        if (type === "dolphin") {
          // 海豚 360 度翻跟斗 + 噴灑彩虹氣泡雨
          ParticleFX.burst(x, y, "bubble", 28);
          ParticleFX.burst(x, y, "sparkle", 15);
        } else if (type === "seahorse") {
          // 海馬翻跟斗 + 吐愛心小氣泡
          ParticleFX.burst(x, y, "bubble", 22);
        } else if (type === "castle") {
          // 童話沙堡城堡點燈 + 噴射金色星屑煙火
          ParticleFX.burst(x, y, "confetti", 26);
          ParticleFX.burst(x, y, "sparkle", 16);
        } else if (type === "chair" || type === "rings") {
          // 珍珠座椅與愛之環共鳴金光
          ParticleFX.burst(x, y, "sparkle", 26);
        }

        setTimeout(() => egg.classList.remove("egg-triggered"), 1000);
      });
    });
  }

  initEasterEggs();

  // 預設進入第一單元
  goToUnit(1);
});
