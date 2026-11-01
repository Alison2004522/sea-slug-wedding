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
    totalUnits: 15,
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
    if (unitNum === 10) {
      initLevel4VenueInspector();
      const introModal = document.getElementById("venue-intro-modal");
      if (introModal && typeof venueInspectorResetIntro === "function") {
        venueInspectorResetIntro();
      }
    }
    if (unitNum === 12) initUnit12Fireworks();
    if (unitNum === 14) initLevel6Reflection();
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
      cheerImg: "images/cheer_crab.png",
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
      cheerImg: "images/cheer_octopus.png",
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
      cheerImg: "images/cheer_jellyfish.png",
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
      cheerImg: "images/cheer_dolphin.png",
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
          if (knowledgeCheerImg) {
            knowledgeCheerImg.src = curData.cheerImg;
            knowledgeCheerImg.onerror = function() {
              if (this.src.includes('images/level1/')) {
                this.src = this.src.replace('images/level1/', 'images/');
              } else if (!this.src.includes('house_')) {
                this.src = `images/house_${curData.target}.png`;
              }
            };
          }
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
        correctFeedback: "與其替亮亮和閃閃決定，不如先聽聽牠們的想法。",
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
          veilLayer.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
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
          clothLayer.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
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
          hatLayer.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
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
          <img src="images/accessories/${item.file}" alt="${item.name}" class="cloth-item-thumb" onerror="if(this.src.includes('/accessories/')){this.src=this.src.replace('/accessories/','/');}">
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
        vLiangVeil.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
        vLiangVeil.className = `acc-layer layer-veil ${salonState.liang.veil.extraClass || ""}`;
        vLiangVeil.classList.remove("hidden");
      } else { vLiangVeil.classList.add("hidden"); }

      if (salonState.liang.clothing) {
        vLiangCloth.src = `images/accessories/${salonState.liang.clothing.file}`;
        vLiangCloth.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
        vLiangCloth.className = `acc-layer layer-clothing ${salonState.liang.clothing.extraClass || ""}`;
        vLiangCloth.classList.remove("hidden");
      } else { vLiangCloth.classList.add("hidden"); }

      if (salonState.liang.hat) {
        vLiangHat.src = `images/accessories/${salonState.liang.hat.file}`;
        vLiangHat.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
        vLiangHat.className = `acc-layer layer-hat ${salonState.liang.hat.extraClass || ""}`;
        vLiangHat.classList.remove("hidden");
      } else { vLiangHat.classList.add("hidden"); }

      // 同步成果展台的閃閃
      const vShanVeil = document.getElementById("v-layer-shan-veil");
      const vShanCloth = document.getElementById("v-layer-shan-clothing");
      const vShanHat = document.getElementById("v-layer-shan-hat");
      if (salonState.shan.veil) {
        vShanVeil.src = `images/accessories/${salonState.shan.veil.file}`;
        vShanVeil.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
        vShanVeil.className = `acc-layer layer-veil ${salonState.shan.veil.extraClass || ""}`;
        vShanVeil.classList.remove("hidden");
      } else { vShanVeil.classList.add("hidden"); }

      if (salonState.shan.clothing) {
        vShanCloth.src = `images/accessories/${salonState.shan.clothing.file}`;
        vShanCloth.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
        vShanCloth.className = `acc-layer layer-clothing ${salonState.shan.clothing.extraClass || ""}`;
        vShanCloth.classList.remove("hidden");
      } else { vShanCloth.classList.add("hidden"); }

      if (salonState.shan.hat) {
        vShanHat.src = `images/accessories/${salonState.shan.hat.file}`;
        vShanHat.onerror = function() { if (this.src.includes('/accessories/')) this.src = this.src.replace('/accessories/', '/'); };
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
  // 【關卡 4・單元 10】婚禮場地檢查員 (非線性探索・全景引導・物件鎖定版)
  // ------------------------------------------
  let venueInspectorInited = false;
  let venueInspectorResetIntro = null;

  const venueInspectorState = {
    // 四大任務完成狀態：1 走道、2 座位、3 燈光、4 拍照
    completedTasks: { 1: false, 2: false, 3: false, 4: false },
    readNeeds: {
      crab: false,
      octopus: false,
      jellyfish: false,
      dolphin: false
    },
    focusedResident: null, // 初始為 null (全景引導模式)
    currentSpeaker: null,

    // 任務 1：走道裝飾物品放置 (chair, stand, sign)
    itemPositions: {
      chair: "corridor-1", // 擋住通道
      stand: "corridor-2", // 擋住通道
      sign: "side-left"    // 安全位置
    },
    selectedItem: null,

    // 任務 2：座位安排 (章魚裁縫師與海龜朋友)
    signType: "gender_split", // "gender_split" or "free_seating"
    guestSeats: {
      octopus: null,        // 座位 1~6 或 null
      octopus_friend: null  // 座位 1~6 或 null
    },
    selectedGuest: null,    // 點選入座選取態

    // 任務 3：老水母燈光
    lighting: {
      stageBrightness: "bright",
      seatBrightness: "bright", // 需為 soft
      effect: "stable",
      direction: "seating"      // 需為 stage
    },

    // 任務 4：海豚寶寶拍照安排
    photoState: {
      jumpSignRemoved: false,  // 是否撤下指定跳躍牌
      selectedPose: null,      // "smile" or "fin"
      dolphinConfirmed: false, // 是否確認滿意
      photoTaken: false        // 是否已拍下照片
    },

    isReviewingVenue: false
  };

  function initLevel4VenueInspector() {
    const root = document.getElementById("venue-inspector-game");
    if (!root) return;

    if (venueInspectorInited) {
      if (typeof refreshVenueUI === "function") refreshVenueUI();
      return;
    }
    venueInspectorInited = true;

    // DOM 元素引用
    const introModal = document.getElementById("venue-intro-modal");
    const helpModal = document.getElementById("venue-help-modal");
    const victoryModal = document.getElementById("venue-victory-modal");
    const btnStartInspection = document.getElementById("btn-start-venue-inspection");
    const btnCloseHelp = document.getElementById("btn-close-venue-help");
    const btnViHelp = document.getElementById("btn-vi-help");
    const btnViHint = document.getElementById("btn-vi-hint");
    const btnViVerify = document.getElementById("btn-vi-verify");
    const btnViTakePhoto = document.getElementById("btn-vi-take-photo");

    const stepBadge = document.getElementById("vi-step-badge");
    const progressText = document.getElementById("vi-progress-text");
    const badgeTask1 = document.getElementById("vi-badge-task1");
    const badgeTask2 = document.getElementById("vi-badge-task2");
    const badgeTask3 = document.getElementById("vi-badge-task3");
    const badgeTask4 = document.getElementById("vi-badge-task4");

    const exclaimCrab = document.getElementById("exclaim-crab");
    const exclaimOctopus = document.getElementById("exclaim-octopus");
    const exclaimJellyfish = document.getElementById("exclaim-jellyfish");
    const exclaimDolphin = document.getElementById("exclaim-dolphin");

    const ctrlIntro = document.getElementById("vi-ctrl-intro");
    const ctrlCrab = document.getElementById("vi-ctrl-crab");
    const ctrlOctopus = document.getElementById("vi-ctrl-octopus");
    const ctrlJellyfish = document.getElementById("vi-ctrl-jellyfish");
    const ctrlDolphin = document.getElementById("vi-ctrl-dolphin");

    const feedbackToast = document.getElementById("vi-feedback-toast");
    const feedbackMsg = document.getElementById("vi-fb-msg");
    const feedbackIcon = document.getElementById("vi-fb-icon");

    // 對話區域
    const avatarImg = document.getElementById("vi-dialogue-avatar");
    const speakerNameEl = document.getElementById("vi-speaker-name");
    const needTagEl = document.getElementById("vi-speech-need-tag");
    const speechTextEl = document.getElementById("vi-speech-text");
    const btnListenNeeds = document.getElementById("btn-listen-needs");

    // 區域 1 走道物件與螃蟹
    const moveableItems = root.querySelectorAll(".vi-moveable-item");
    const allSlots = root.querySelectorAll(".vi-item-slot");
    const crabImgEl = document.getElementById("actor-img-crab");

    // 區域 2 座位
    const seatingWaitingTop = document.getElementById("seating-waiting-top");
    const seatingSignImg = document.getElementById("vi-sign-img");
    const btnToggleSign = document.getElementById("btn-ctrl-toggle-sign");
    const viSeatingSign = document.getElementById("vi-seating-sign");
    const seatCells = root.querySelectorAll(".vi-seat-cell");
    const waitingActorOctopus = document.getElementById("guest-actor-octopus");
    const waitingActorTurtle = document.getElementById("guest-actor-turtle");

    // 區域 3 燈光與老水母
    const lightingOverlay = document.getElementById("venue-lighting-overlay");
    const spotlightBeam = document.getElementById("venue-spotlight");
    const lightOptionButtons = root.querySelectorAll(".btn-light-opt");
    const jellyfishActorWrap = document.getElementById("actor-wrap-jellyfish");
    const jellyfishImgEl = document.getElementById("actor-img-jellyfish");

    // 區域 4 海豚拍照
    const actorWrapDolphin = document.getElementById("actor-wrap-dolphin");
    const dolphinImgEl = document.getElementById("actor-img-dolphin");
    const jumpSignItem = document.getElementById("vi-jump-sign");
    const btnRemoveJump = document.getElementById("btn-ctrl-remove-jump");
    const poseButtons = root.querySelectorAll(".btn-pose-opt");
    const btnConfirmPose = document.getElementById("btn-confirm-pose");
    const dolphinPoseChip = document.getElementById("dolphin-pose-chip");
    const polaroidCard = document.getElementById("polaroid-photo-card");
    const polaroidPreview = document.getElementById("polaroid-img-preview");
    const polaroidCaption = document.getElementById("polaroid-caption");

    // 成果彈窗控制
    const btnViewVenue = document.getElementById("btn-vi-view-venue");
    const btnReplay = document.getElementById("btn-vi-replay");
    const btnContinueStory = document.getElementById("btn-vi-continue-story");
    const btnReturnSummary = document.getElementById("btn-vi-return-summary");
    const victoryPolaroidImg = document.getElementById("v-polaroid-img");
    const victoryPolaroidLabel = document.getElementById("v-polaroid-label");

    // 角色對話台詞與表情頭像設定
    const residentDialogues = {
      crab: {
        name: "螃蟹阿姨",
        avatarConfused: "images/resident_crab_confused.png",
        avatarHappy: "images/cheer_crab.png",
        initial: "「入口好漂亮！可是這裡有點擠，我想和朋友一起進去，卻不太方便。」",
        detail: "「通道中央被椅子和花架擋住了！如果能把走道空出來，我和朋友就可以順暢地進去了。」",
        solved: "「哇！走道變得好寬敞，我和朋友可以並肩走進婚禮現場囉，謝謝你！」",
        hint: "請點選走道中央的物品，再點選兩側綠色的安全區域，把中央通道徹底空出來！"
      },
      octopus: {
        name: "章魚裁縫師",
        avatarConfused: "images/困擾章魚.png",
        avatarHappy: "images/cheer_octopus.png",
        initial: "「婚禮現場好熱鬧！但我看到座位牌寫著男女分開坐，我很想跟好朋友小海龜坐在一起呢……」",
        detail: "「我們想坐在一起聊天，不用特別按照性別分開坐。可以換成大家都能自由入座的標牌，並將我們排在相鄰的座位嗎？」",
        solved: "「太棒了！自由入座讓我和小海龜可以相鄰坐在一起，真期待婚禮開始！」",
        hint: "點選『更換為自由入座標牌』，再拖曳章魚和小海龜至相鄰的座位（例如座位 1 與 2，或 2 與 3）！"
      },
      jellyfish: {
        name: "老水母",
        avatarConfused: "images/resident_jellyfish_dazzled.png",
        avatarHappy: "images/cheer_jellyfish.png",
        initial: "「哎呀呀，眼睛好酸喔……舞台上面的聚光燈好像一直照著我的眼睛，有點太刺眼了。」",
        detail: "「我的眼睛對強光比較敏感。如果賓客座位區的燈光能柔和一點，聚光燈朝向舞台而不是座位，我就能舒服觀禮了！」",
        solved: "「呼～現在光線柔和又舒服，聚光燈正對著舞台，太感謝你的細心調整了！」",
        hint: "將『座位亮度』切換為『柔和』，並將『聚光方向』調整為『舞台』，避免強光直射座位！"
      },
      dolphin: {
        name: "海豚寶寶",
        avatarConfused: "images/resident_dolphin_hesitant.png",
        avatarHappy: "images/resident_dolphin_calm.png",
        initial: "「我想和朋友一起拍照，可是今天不想跳躍，想安靜地待在朋友旁邊。」",
        detail: "「我很想一起拍照，可是今天想安靜地待在朋友旁邊，不想表演跳躍。可以幫我調整一下嗎？」",
        solved: "「太開心了！不用勉強表演跳躍，可以照自己喜歡的樣子拍照，真是最自在的合照！」",
        hint: "先撤下地上的『跳躍表演區』標牌，替海豚寶寶選擇一個喜歡的姿勢，再點擊確認！"
      }
    };

    // 音效輔助
    function playTone(freq, type = "sine", duration = 0.15) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (err) {}
    }

    function playCameraShutterSound() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (e) {}
    }

    function showToast(msg, icon = "💡") {
      if (!feedbackToast || !feedbackMsg) return;
      if (feedbackIcon) feedbackIcon.textContent = icon;
      feedbackMsg.textContent = msg;
      feedbackToast.classList.remove("hidden");
      setTimeout(() => {
        feedbackToast.classList.add("hidden");
      }, 4000);
    }

    // 檢查章魚與海龜是否相鄰
    function checkSeatingAdjacent() {
      const oSeat = venueInspectorState.guestSeats.octopus;
      const tSeat = venueInspectorState.guestSeats.octopus_friend;
      if (!oSeat || !tSeat) return false;

      const validPairs = [
        [1, 2], [2, 1],
        [2, 3], [3, 2],
        [4, 5], [5, 4],
        [5, 6], [6, 5]
      ];
      return validPairs.some(p => p[0] === oSeat && p[1] === tSeat);
    }

    // 聚焦居民切換
    function focusResident(residentKey) {
      venueInspectorState.focusedResident = residentKey;
      venueInspectorState.currentSpeaker = residentKey;

      const crabNode = document.getElementById("actor-wrap-crab");
      const jellyfishNode = document.getElementById("actor-wrap-jellyfish");
      const dolphinNode = document.getElementById("actor-wrap-dolphin");
      const octopusNode = document.getElementById("guest-actor-octopus");

      [crabNode, jellyfishNode, dolphinNode, octopusNode].forEach(node => {
        if (node) node.classList.remove("focused");
      });

      if (residentKey === "crab" && crabNode) crabNode.classList.add("focused");
      if (residentKey === "jellyfish" && jellyfishNode) jellyfishNode.classList.add("focused");
      if (residentKey === "dolphin" && dolphinNode) dolphinNode.classList.add("focused");
      if (residentKey === "octopus" && octopusNode) octopusNode.classList.add("focused");

      // 切換右側控制面板
      if (ctrlIntro) ctrlIntro.classList.toggle("hidden", residentKey !== null);
      if (ctrlCrab) ctrlCrab.classList.toggle("hidden", residentKey !== "crab");
      if (ctrlOctopus) ctrlOctopus.classList.toggle("hidden", residentKey !== "octopus");
      if (ctrlJellyfish) ctrlJellyfish.classList.toggle("hidden", residentKey !== "jellyfish");
      if (ctrlDolphin) ctrlDolphin.classList.toggle("hidden", residentKey !== "dolphin");

      if (stepBadge) {
        const nameMap = { crab: "檢查入口通道", octopus: "檢查座位安排", jellyfish: "檢查舞台燈光", dolphin: "檢查合照攝影" };
        stepBadge.textContent = nameMap[residentKey] || "自由探索中 🔍";
      }

      updateActionButtonVisibility();
      updateDialogueUI();
    }

    function updateActionButtonVisibility() {
      const curRes = venueInspectorState.focusedResident;
      if (curRes === null) {
        if (btnViVerify) btnViVerify.classList.add("hidden");
        if (btnViTakePhoto) btnViTakePhoto.classList.add("hidden");
        return;
      }

      const isDolphin = (curRes === "dolphin");
      const canPhoto = isDolphin && venueInspectorState.photoState.dolphinConfirmed && !venueInspectorState.completedTasks[4];

      if (btnViVerify) btnViVerify.classList.toggle("hidden", canPhoto);
      if (btnViTakePhoto) btnViTakePhoto.classList.toggle("hidden", !canPhoto);
    }

    function updateDialogueUI() {
      const resKey = venueInspectorState.focusedResident;

      if (resKey === null) {
        // 全景引導模式
        if (avatarImg) avatarImg.src = "images/liang_base.png";
        if (speakerNameEl) speakerNameEl.textContent = "婚禮小導遊";
        if (needTagEl) {
          needTagEl.textContent = "🌟 自由探索中";
          needTagEl.classList.remove("read");
        }
        if (speechTextEl) {
          speechTextEl.textContent = "好多海洋朋友來參加婚禮，但牠們好像都遇到了一些小問題呢！請觀察場地，點擊頭頂帶有紅色驚嘆號（❗）的朋友，傾聽牠們的需求吧！";
        }
        if (btnListenNeeds) btnListenNeeds.classList.add("hidden");
        return;
      }

      const data = residentDialogues[resKey];
      if (!data) return;

      const taskIndexMap = { crab: 1, octopus: 2, jellyfish: 3, dolphin: 4 };
      const isSolved = venueInspectorState.completedTasks[taskIndexMap[resKey]];
      const isRead = venueInspectorState.readNeeds[resKey];

      if (avatarImg) {
        avatarImg.src = isSolved ? data.avatarHappy : data.avatarConfused;
      }
      if (speakerNameEl) speakerNameEl.textContent = data.name;

      if (needTagEl) {
        needTagEl.textContent = isSolved ? "困擾已解決 ✓" : (isRead ? "已了解需求" : "未聽取想法");
        needTagEl.classList.toggle("read", isRead || isSolved);
      }

      if (speechTextEl) {
        if (isSolved) {
          speechTextEl.textContent = data.solved;
        } else if (isRead) {
          speechTextEl.textContent = data.detail;
        } else {
          speechTextEl.textContent = data.initial;
        }
      }

      if (btnListenNeeds) {
        btnListenNeeds.classList.toggle("hidden", isRead || isSolved);
      }
    }

    function listenCurrentNeeds() {
      const resKey = venueInspectorState.focusedResident;
      if (!resKey) return;
      venueInspectorState.readNeeds[resKey] = true;
      playTone(523.25);
      playTone(659.25);
      showToast(`已了解${residentDialogues[resKey].name}的想法！`, "👂");
      updateDialogueUI();
    }

    // 全場景 UI 與居民表情同步渲染
    function refreshVenueUI() {
      // 1. 進度與徽章
      const solvedCount = Object.values(venueInspectorState.completedTasks).filter(Boolean).length;
      if (progressText) {
        progressText.textContent = `已完成 ${solvedCount}／4 項場地檢查`;
      }

      if (badgeTask1) badgeTask1.classList.toggle("completed", !!venueInspectorState.completedTasks[1]);
      if (badgeTask2) badgeTask2.classList.toggle("completed", !!venueInspectorState.completedTasks[2]);
      if (badgeTask3) badgeTask3.classList.toggle("completed", !!venueInspectorState.completedTasks[3]);
      if (badgeTask4) badgeTask4.classList.toggle("completed", !!venueInspectorState.completedTasks[4]);

      // 2. 驚嘆號顯隱控制（解決後消失）
      if (exclaimCrab) exclaimCrab.classList.toggle("solved", !!venueInspectorState.completedTasks[1]);
      if (exclaimOctopus) exclaimOctopus.classList.toggle("solved", !!venueInspectorState.completedTasks[2]);
      if (exclaimJellyfish) exclaimJellyfish.classList.toggle("solved", !!venueInspectorState.completedTasks[3]);
      if (exclaimDolphin) exclaimDolphin.classList.toggle("solved", !!venueInspectorState.completedTasks[4]);

      // 3. 螃蟹阿姨表情與走道物品鎖定
      if (crabImgEl) {
        crabImgEl.src = venueInspectorState.completedTasks[1]
          ? "images/cheer_crab.png"
          : "images/resident_crab_confused.png";
      }

      const isTask1Done = venueInspectorState.completedTasks[1];
      moveableItems.forEach(itemEl => {
        itemEl.classList.toggle("locked", isTask1Done);
        if (isTask1Done) {
          itemEl.removeAttribute("draggable");
        } else {
          itemEl.setAttribute("draggable", "true");
        }
      });

      syncItemPositions();

      // 4. 座位區同步與章魚/海龜表情切換
      if (seatingSignImg) {
        seatingSignImg.src = (venueInspectorState.signType === "free_seating")
          ? "images/sign_free_seating.png"
          : "images/sign_gender_split.png";
      }
      if (btnToggleSign) {
        btnToggleSign.textContent = (venueInspectorState.signType === "free_seating")
          ? "🏷️ 當前標牌：自由入座 ✓"
          : "🏷️ 更換為自由入座標牌";
      }

      const isTask2Done = venueInspectorState.completedTasks[2];
      if (viSeatingSign) viSeatingSign.classList.toggle("locked", isTask2Done);
      if (btnToggleSign) btnToggleSign.disabled = isTask2Done;

      const isAdjacent = checkSeatingAdjacent();

      // 更新 6 格座位渲染（帶有拖曳支援與嚴格防重複）
      seatCells.forEach(cell => {
        const seatId = parseInt(cell.dataset.seat, 10);
        cell.classList.toggle("locked", isTask2Done);
        const occupantWrap = cell.querySelector(".seat-occupant-wrap");
        if (!occupantWrap) return;
        occupantWrap.innerHTML = "";

        for (const [guestKey, sId] of Object.entries(venueInspectorState.guestSeats)) {
          if (sId === seatId) {
            const img = document.createElement("img");
            if (guestKey === "octopus") {
              img.src = isAdjacent ? "images/cheer_octopus.png" : "images/困擾章魚.png";
              img.alt = "章魚裁縫師";
            } else {
              img.src = isAdjacent ? "images/resident_octopus_friend.png" : "images/困擾海龜.png";
              img.alt = "好友海龜";
            }
            img.dataset.guest = guestKey;

            // 若任務 2 未完成，座位上的角色支援再次拖曳換座
            if (!isTask2Done) {
              img.setAttribute("draggable", "true");
              img.addEventListener("dragstart", (e) => {
                focusResident("octopus");
                e.dataTransfer.setData("text/plain", guestKey);
              });
            }

            occupantWrap.appendChild(img);
          }
        }
      });

      // 更新上方待入座朋友節點狀態
      if (waitingActorOctopus) {
        const isOctopusSeated = venueInspectorState.guestSeats.octopus !== null;
        waitingActorOctopus.classList.toggle("seated-out", isOctopusSeated);
        waitingActorOctopus.classList.toggle("locked", isTask2Done);
        if (isTask2Done) waitingActorOctopus.removeAttribute("draggable");
      }
      if (waitingActorTurtle) {
        const isTurtleSeated = venueInspectorState.guestSeats.octopus_friend !== null;
        waitingActorTurtle.classList.toggle("seated-out", isTurtleSeated);
        waitingActorTurtle.classList.toggle("locked", isTask2Done);
        if (isTask2Done) waitingActorTurtle.removeAttribute("draggable");
      }

      // 5. 燈光與老水母表情狀態切換
      const light = venueInspectorState.lighting;
      if (lightingOverlay) {
        lightingOverlay.className = `venue-lighting-overlay seat-${light.seatBrightness}`;
      }
      if (spotlightBeam) {
        spotlightBeam.className = `venue-spotlight target-${light.direction} effect-${light.effect}`;
      }

      const isTask3Done = venueInspectorState.completedTasks[3];
      lightOptionButtons.forEach(btn => {
        const grp = btn.dataset.group;
        const val = btn.dataset.val;
        btn.classList.toggle("active", light[grp] === val);
        btn.disabled = isTask3Done;
        btn.classList.toggle("locked", isTask3Done);
      });

      if (jellyfishImgEl) {
        jellyfishImgEl.src = isTask3Done
          ? "images/cheer_jellyfish.png"
          : "images/resident_jellyfish_dazzled.png";
      }
      if (jellyfishActorWrap) {
        const isDazzled = (light.seatBrightness === "bright" || light.direction === "seating") && !isTask3Done;
        jellyfishActorWrap.classList.toggle("dazzled-jellyfish", isDazzled);
        jellyfishActorWrap.classList.toggle("calm-jellyfish", !isDazzled);
      }

      // 6. 海豚寶寶表情切換與拍照狀態
      const pState = venueInspectorState.photoState;
      const isTask4Done = venueInspectorState.completedTasks[4];

      if (dolphinImgEl) {
        dolphinImgEl.src = isTask4Done
          ? "images/resident_dolphin_calm.png"
          : "images/resident_dolphin_hesitant.png";
      }

      if (jumpSignItem) {
        jumpSignItem.classList.toggle("hidden", pState.jumpSignRemoved);
      }
      if (btnRemoveJump) {
        btnRemoveJump.classList.toggle("done", pState.jumpSignRemoved);
        btnRemoveJump.textContent = pState.jumpSignRemoved ? "跳躍牌已撤下 ✓" : "收起指定跳躍牌 ✕";
        btnRemoveJump.disabled = isTask4Done;
      }

      poseButtons.forEach(btn => {
        const poseVal = btn.dataset.pose;
        btn.classList.toggle("active", pState.selectedPose === poseVal);
        btn.disabled = isTask4Done;
      });

      if (dolphinPoseChip) {
        if (pState.selectedPose === "smile") {
          dolphinPoseChip.textContent = "【自在微笑】";
        } else if (pState.selectedPose === "fin") {
          dolphinPoseChip.textContent = "【輕擺胸鰭】";
        } else {
          dolphinPoseChip.textContent = pState.jumpSignRemoved ? "【未定姿勢】" : "【指定跳躍】";
        }
      }

      if (btnConfirmPose) {
        btnConfirmPose.classList.toggle("confirmed", pState.dolphinConfirmed);
        btnConfirmPose.textContent = pState.dolphinConfirmed ? "海豚寶寶很喜歡 ✓" : "這樣拍可以嗎？";
        btnConfirmPose.disabled = isTask4Done;
      }

      updateActionButtonVisibility();
      updateDialogueUI();
    }

    function syncItemPositions() {
      moveableItems.forEach(itemEl => {
        const itemKey = itemEl.dataset.item;
        const slotKey = venueInspectorState.itemPositions[itemKey];
        const slotEl = root.querySelector(`[data-slot="${slotKey}"]`);
        if (slotEl) {
          itemEl.style.left = `${slotEl.offsetLeft}px`;
          itemEl.style.top = `${slotEl.offsetTop}px`;
        }
        itemEl.classList.toggle("selected", venueInspectorState.selectedItem === itemKey);
      });
    }

    // 自動導引至下一個未完成居民
    function autoGuideToNextResident(completedTaskId) {
      const taskResidentMap = { 1: "crab", 2: "octopus", 3: "jellyfish", 4: "dolphin" };
      const residentOrder = ["crab", "octopus", "jellyfish", "dolphin"];
      const nextResidents = residentOrder.filter((r, idx) => !venueInspectorState.completedTasks[idx + 1]);

      if (nextResidents.length > 0) {
        setTimeout(() => {
          focusResident(nextResidents[0]);
          showToast(`太棒了！接著來看看${residentDialogues[nextResidents[0]].name}需要什麼協助吧！`, "✨");
        }, 1200);
      }
    }

    // ------------------------------------------
    // 綁定事件監聽
    // ------------------------------------------

    // 1. 居民節點點選（非線性切換）
    const crabInteractive = document.getElementById("actor-wrap-crab");
    if (crabInteractive) {
      crabInteractive.addEventListener("click", () => {
        focusResident("crab");
        playTone(440);
      });
    }

    const jellyfishInteractive = document.getElementById("actor-wrap-jellyfish");
    if (jellyfishInteractive) {
      jellyfishInteractive.addEventListener("click", () => {
        focusResident("jellyfish");
        playTone(493.88);
      });
    }

    const dolphinInteractive = document.getElementById("actor-wrap-dolphin");
    if (dolphinInteractive) {
      dolphinInteractive.addEventListener("click", () => {
        focusResident("dolphin");
        playTone(587.33);
      });
    }

    if (waitingActorOctopus) {
      waitingActorOctopus.addEventListener("click", () => {
        focusResident("octopus");
        playTone(523.25);
      });
    }

    if (waitingActorTurtle) {
      waitingActorTurtle.addEventListener("click", () => {
        focusResident("octopus");
        playTone(523.25);
      });
    }

    if (badgeTask1) badgeTask1.addEventListener("click", () => focusResident("crab"));
    if (badgeTask2) badgeTask2.addEventListener("click", () => focusResident("octopus"));
    if (badgeTask3) badgeTask3.addEventListener("click", () => focusResident("jellyfish"));
    if (badgeTask4) badgeTask4.addEventListener("click", () => focusResident("dolphin"));

    if (btnListenNeeds) {
      btnListenNeeds.addEventListener("click", listenCurrentNeeds);
    }

    // 2. 任務一：走道物件點選與放置（拖曳與點擊防呆）
    moveableItems.forEach(item => {
      item.addEventListener("click", (e) => {
        if (venueInspectorState.completedTasks[1]) return; // 已鎖定
        e.stopPropagation();
        focusResident("crab");
        const itemKey = item.dataset.item;
        if (venueInspectorState.selectedItem === itemKey) {
          venueInspectorState.selectedItem = null;
        } else {
          venueInspectorState.selectedItem = itemKey;
          playTone(440);
          showToast("已選取物件，請點選要放置的綠色安全槽位！", "📦");
        }
        refreshVenueUI();
      });

      item.addEventListener("dragstart", (e) => {
        if (venueInspectorState.completedTasks[1]) return;
        focusResident("crab");
        venueInspectorState.selectedItem = item.dataset.item;
        e.dataTransfer.setData("text/plain", item.dataset.item);
      });
    });

    allSlots.forEach(slot => {
      slot.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[1]) return;
        if (!venueInspectorState.selectedItem) return;
        const itemKey = venueInspectorState.selectedItem;
        const targetSlot = slot.dataset.slot;

        for (const [it, sl] of Object.entries(venueInspectorState.itemPositions)) {
          if (sl === targetSlot && it !== itemKey) {
            venueInspectorState.itemPositions[it] = venueInspectorState.itemPositions[itemKey];
          }
        }
        venueInspectorState.itemPositions[itemKey] = targetSlot;
        venueInspectorState.selectedItem = null;
        playTone(587.33);
        refreshVenueUI();
      });

      slot.addEventListener("dragover", (e) => e.preventDefault());
      slot.addEventListener("drop", (e) => {
        if (venueInspectorState.completedTasks[1]) return;
        e.preventDefault();
        const itemKey = e.dataTransfer.getData("text/plain") || venueInspectorState.selectedItem;
        if (!itemKey) return;
        const targetSlot = slot.dataset.slot;

        for (const [it, sl] of Object.entries(venueInspectorState.itemPositions)) {
          if (sl === targetSlot && it !== itemKey) {
            venueInspectorState.itemPositions[it] = venueInspectorState.itemPositions[itemKey];
          }
        }
        venueInspectorState.itemPositions[itemKey] = targetSlot;
        venueInspectorState.selectedItem = null;
        playTone(587.33);
        refreshVenueUI();
      });
    });

    // 3. 任務二：座位切換標牌與純拖曳入座（入座後可再次拖曳更換座位）
    if (btnToggleSign) {
      btnToggleSign.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[2]) return;
        focusResident("octopus");
        venueInspectorState.signType = (venueInspectorState.signType === "gender_split")
          ? "free_seating"
          : "gender_split";
        playTone(659.25);
        if (venueInspectorState.signType === "free_seating") {
          showToast("已更換為自由入座標牌！大家可以自由選擇喜歡的位子。", "🏷️");
        }
        refreshVenueUI();
      });
    }

    if (viSeatingSign) {
      viSeatingSign.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[2]) return;
        if (btnToggleSign) btnToggleSign.click();
      });
    }

    // 上方待入座角色拖曳綁定
    function bindTopGuestDrag(el, guestKey) {
      if (!el) return;
      el.addEventListener("dragstart", (e) => {
        if (venueInspectorState.completedTasks[2]) return;
        focusResident("octopus");
        e.dataTransfer.setData("text/plain", guestKey);
      });
      // 也支援點擊選取入座
      el.addEventListener("click", (e) => {
        if (venueInspectorState.completedTasks[2]) return;
        e.stopPropagation();
        focusResident("octopus");
        if (venueInspectorState.selectedGuest === guestKey) {
          venueInspectorState.selectedGuest = null;
        } else {
          venueInspectorState.selectedGuest = guestKey;
          playTone(523.25);
          showToast(`已選取${guestKey === "octopus" ? "章魚裁縫師" : "好友海龜"}，請拖曳或點選座位安排入座！`, "🪑");
        }
        refreshVenueUI();
      });
    }

    bindTopGuestDrag(waitingActorOctopus, "octopus");
    bindTopGuestDrag(waitingActorTurtle, "octopus_friend");

    // 上方區域支援拖回放手（取消入座）
    if (seatingWaitingTop) {
      seatingWaitingTop.addEventListener("dragover", (e) => e.preventDefault());
      seatingWaitingTop.addEventListener("drop", (e) => {
        if (venueInspectorState.completedTasks[2]) return;
        e.preventDefault();
        const gKey = e.dataTransfer.getData("text/plain");
        if (gKey === "octopus" || gKey === "octopus_friend") {
          venueInspectorState.guestSeats[gKey] = null;
          venueInspectorState.selectedGuest = null;
          playTone(440);
          showToast(`已將${gKey === "octopus" ? "章魚裁縫師" : "好友海龜"}移回上方！`, "↩️");
          refreshVenueUI();
        }
      });
    }

    // 6 格座位拖放處理（支援從上方拖入、從座位拖到另一個座位、點擊入座）
    seatCells.forEach(cell => {
      const seatId = parseInt(cell.dataset.seat, 10);

      cell.addEventListener("dragover", (e) => e.preventDefault());
      cell.addEventListener("drop", (e) => {
        if (venueInspectorState.completedTasks[2]) return;
        e.preventDefault();
        const gKey = e.dataTransfer.getData("text/plain");
        if (gKey !== "octopus" && gKey !== "octopus_friend") return;

        focusResident("octopus");
        const origSeat = venueInspectorState.guestSeats[gKey];
        const otherKey = (gKey === "octopus") ? "octopus_friend" : "octopus";

        // 若目標座位上已有另一個角色，兩者交換座位！
        if (venueInspectorState.guestSeats[otherKey] === seatId) {
          venueInspectorState.guestSeats[otherKey] = origSeat;
        }

        // 指派新座位
        venueInspectorState.guestSeats[gKey] = seatId;
        venueInspectorState.selectedGuest = null;
        playTone(659.25);
        refreshVenueUI();
      });

      // 點擊入座防呆相容
      cell.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[2]) return;
        focusResident("octopus");

        if (venueInspectorState.selectedGuest) {
          const gKey = venueInspectorState.selectedGuest;
          const origSeat = venueInspectorState.guestSeats[gKey];
          const otherKey = (gKey === "octopus") ? "octopus_friend" : "octopus";

          if (venueInspectorState.guestSeats[otherKey] === seatId) {
            venueInspectorState.guestSeats[otherKey] = origSeat;
          }
          venueInspectorState.guestSeats[gKey] = seatId;
          venueInspectorState.selectedGuest = null;
          playTone(659.25);
        } else {
          // 點擊已有角色的座位可取消入座（放回上方）
          for (const [gKey, sId] of Object.entries(venueInspectorState.guestSeats)) {
            if (sId === seatId) {
              venueInspectorState.guestSeats[gKey] = null;
              playTone(440);
              break;
            }
          }
        }
        refreshVenueUI();
      });
    });

    // 4. 任務三：老水母燈光控制
    lightOptionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[3]) return;
        focusResident("jellyfish");
        const grp = btn.dataset.group;
        const val = btn.dataset.val;
        venueInspectorState.lighting[grp] = val;
        playTone(523.25);
        refreshVenueUI();
      });
    });

    // 5. 任務四：海豚合照攝影互動
    function removeJumpSignAction() {
      if (venueInspectorState.completedTasks[4]) return;
      focusResident("dolphin");
      if (!venueInspectorState.readNeeds.dolphin) {
        showToast("先問問海豚寶寶想怎麼拍吧！", "👂");
        return;
      }
      venueInspectorState.photoState.jumpSignRemoved = true;
      venueInspectorState.photoState.dolphinConfirmed = false;
      playTone(659.25);
      showToast("跳躍表演區標牌已撤下！現在請幫海豚寶寶選擇一個舒服的姿勢。", "✨");
      refreshVenueUI();
    }

    if (btnRemoveJump) btnRemoveJump.addEventListener("click", removeJumpSignAction);
    if (jumpSignItem) jumpSignItem.addEventListener("click", removeJumpSignAction);

    poseButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[4]) return;
        focusResident("dolphin");
        if (!venueInspectorState.readNeeds.dolphin) {
          showToast("先問問海豚寶寶想怎麼拍吧！", "👂");
          return;
        }
        if (!venueInspectorState.photoState.jumpSignRemoved) {
          showToast("請先收起地上的跳躍表演區標牌喔！", "🏷️");
          return;
        }
        const pose = btn.dataset.pose;
        venueInspectorState.photoState.selectedPose = pose;
        venueInspectorState.photoState.dolphinConfirmed = false;
        playTone(783.99);
        refreshVenueUI();
      });
    });

    if (btnConfirmPose) {
      btnConfirmPose.addEventListener("click", () => {
        if (venueInspectorState.completedTasks[4]) return;
        focusResident("dolphin");
        if (!venueInspectorState.readNeeds.dolphin) {
          showToast("先問問海豚寶寶想怎麼拍吧！", "👂");
          return;
        }
        if (!venueInspectorState.photoState.jumpSignRemoved) {
          showToast("地上的跳躍表演區標牌還在呢，先收起來吧！", "🏷️");
          return;
        }
        if (!venueInspectorState.photoState.selectedPose) {
          showToast("請先選擇一個海豚寶寶喜歡的姿勢喔！", "🐬");
          return;
        }

        venueInspectorState.photoState.dolphinConfirmed = true;
        playTone(880);
        showToast("海豚寶寶：「這個姿勢好自在，我很喜歡！請幫我們拍張照吧！」", "💖");
        refreshVenueUI();
      });
    }

    // 拍照按鈕（展示 1.5 秒後自動隱藏）
    if (btnViTakePhoto) {
      btnViTakePhoto.addEventListener("click", () => {
        if (!venueInspectorState.photoState.dolphinConfirmed) {
          showToast("請先確認海豚寶寶滿意這個拍照安排喔！", "🐬");
          return;
        }

        playCameraShutterSound();
        venueInspectorState.photoState.photoTaken = true;
        venueInspectorState.completedTasks[4] = true;

        const sceneCanvas = document.getElementById("venue-scene-canvas");
        if (sceneCanvas) {
          sceneCanvas.style.transition = "filter 0.08s ease";
          sceneCanvas.style.filter = "brightness(2.2)";
          setTimeout(() => {
            sceneCanvas.style.filter = "none";
          }, 120);
        }

        if (polaroidCard) {
          polaroidCard.classList.remove("hidden");
          polaroidCard.classList.remove("fade-out");
          if (polaroidPreview) polaroidPreview.src = "images/resident_dolphin_calm.png";
          if (polaroidCaption) {
            polaroidCaption.textContent = (venueInspectorState.photoState.selectedPose === "smile")
              ? "🌟 婚禮試拍：自在微笑合照"
              : "🌟 婚禮試拍：輕擺胸鰭自在留念";
          }

          // 精準展示 1.5 秒後淡出隱藏
          setTimeout(() => {
            polaroidCard.classList.add("fade-out");
            setTimeout(() => {
              polaroidCard.classList.add("hidden");
            }, 400);
          }, 1500);
        }

        if (victoryPolaroidImg) victoryPolaroidImg.src = "images/resident_dolphin_calm.png";
        if (victoryPolaroidLabel) {
          victoryPolaroidLabel.textContent = (venueInspectorState.photoState.selectedPose === "smile")
            ? "🌟 婚禮試拍：自在微笑合照"
            : "🌟 婚禮試拍：輕擺胸鰭自在留念";
        }

        playTone(523.25);
        playTone(659.25);
        playTone(783.99);
        showToast("喀嚓！一張舒服又自在的婚禮試拍合照出爐囉！", "📸");

        refreshVenueUI();
        checkAllTasksCompletion();
        autoGuideToNextResident(4);
      });
    }

    // 6. 「邀請朋友試試看」驗證邏輯
    if (btnViVerify) {
      btnViVerify.addEventListener("click", () => {
        const curRes = venueInspectorState.focusedResident;

        if (curRes === "crab") {
          // 任務 1 驗證：檢查所有物品（椅、花架、立牌），通道區 A 或 B 有任何物件即阻擋
          if (!venueInspectorState.readNeeds.crab) {
            showToast("先聽聽螃蟹阿姨的想法，才知道哪裡需要調整喔！", "👂");
            return;
          }

          const isCorridorBlocked = Object.values(venueInspectorState.itemPositions).some(
            pos => pos === "corridor-1" || pos === "corridor-2"
          );

          if (isCorridorBlocked) {
            playTone(300, "triangle");
            showToast("通道中央好像還有物品擋住喔，請把走道徹底空出來！", "🦀");
            return;
          }

          venueInspectorState.completedTasks[1] = true;
          playTone(523.25);
          playTone(659.25);
          showToast("螃蟹阿姨：「走道好寬敞！我和朋友可以順利通過了，謝謝你！」", "🎉");
          refreshVenueUI();
          checkAllTasksCompletion();
          autoGuideToNextResident(1);

        } else if (curRes === "octopus") {
          // 任務 2 驗證
          if (!venueInspectorState.readNeeds.octopus) {
            showToast("先聽聽章魚裁縫師的想法，再安排座位吧！", "👂");
            return;
          }
          if (venueInspectorState.signType !== "free_seating") {
            playTone(300, "triangle");
            showToast("座位牌還是性別分座呢，換成自由入座試試看吧！", "🏷️");
            return;
          }

          const oSeat = venueInspectorState.guestSeats.octopus;
          const tSeat = venueInspectorState.guestSeats.octopus_friend;

          if (oSeat === null || tSeat === null) {
            playTone(300, "triangle");
            showToast("章魚裁縫師和小海龜還沒有全部入座喔！", "🐙");
            return;
          }

          if (!checkSeatingAdjacent()) {
            playTone(300, "triangle");
            showToast("章魚和小海龜坐得有點遠，牠們想坐在一起聊天喔！", "🐙");
            return;
          }

          venueInspectorState.completedTasks[2] = true;
          playTone(523.25);
          playTone(659.25);
          showToast("章魚裁縫師：「自由入座太棒了，我和小海龜相鄰坐在一起囉！」", "🎉");
          refreshVenueUI();
          checkAllTasksCompletion();
          autoGuideToNextResident(2);

        } else if (curRes === "jellyfish") {
          // 任務 3 驗證
          if (!venueInspectorState.readNeeds.jellyfish) {
            showToast("先聽聽老水母的想法，了解對光線的需求吧！", "👂");
            return;
          }
          const light = venueInspectorState.lighting;
          const seatOk = (light.seatBrightness === "soft");
          const dirOk = (light.direction === "stage");

          if (!seatOk || !dirOk) {
            playTone(300, "triangle");
            if (!seatOk && !dirOk) {
              showToast("座位區還是太亮了，而且聚光燈直射座位，老水母覺得很刺眼呢！", "🪼");
            } else if (!seatOk) {
              showToast("座位區光線還是太刺眼了，調成柔和試試看吧！", "🪼");
            } else {
              showToast("聚光燈還照著座位區呢，讓它照向舞台吧！", "🪼");
            }
            return;
          }

          venueInspectorState.completedTasks[3] = true;
          playTone(523.25);
          playTone(659.25);
          showToast("老水母：「光線變得好柔和，舞台清清楚楚，太舒服了！」", "🎉");
          refreshVenueUI();
          checkAllTasksCompletion();
          autoGuideToNextResident(3);

        } else if (curRes === "dolphin") {
          // 任務 4 驗證
          if (!venueInspectorState.readNeeds.dolphin) {
            showToast("先聽聽海豚寶寶的想法，再安排拍照吧！", "👂");
            return;
          }
          if (!venueInspectorState.photoState.jumpSignRemoved) {
            showToast("地上的跳躍表演區標牌還在呢，先收起來吧！", "🏷️");
            return;
          }
          if (!venueInspectorState.photoState.selectedPose) {
            showToast("請先替海豚寶寶選一個喜歡的姿勢喔！", "🐬");
            return;
          }
          if (!venueInspectorState.photoState.dolphinConfirmed) {
            showToast("請點擊『這樣拍可以嗎？』確認海豚寶寶的意願！", "🤝");
            return;
          }
        }
      });
    }

    // 檢查是否 4 項全部完成
    function checkAllTasksCompletion() {
      const allDone = venueInspectorState.completedTasks[1] &&
                      venueInspectorState.completedTasks[2] &&
                      venueInspectorState.completedTasks[3] &&
                      venueInspectorState.completedTasks[4];

      if (allDone) {
        playTone(523.25);
        setTimeout(() => playTone(659.25), 150);
        setTimeout(() => playTone(783.99), 300);
        setTimeout(() => playTone(1046.50), 450);

        setTimeout(() => {
          if (victoryModal) victoryModal.classList.remove("hidden");
        }, 900);
      }
    }

    // 7. 工具按鈕：提示與說明彈窗
    if (btnViHint) {
      btnViHint.addEventListener("click", () => {
        const resKey = venueInspectorState.focusedResident;
        if (!resKey) {
          showToast("點擊場景中頭頂帶有紅色驚嘆號（❗）的朋友，協助牠們完成婚禮準備！", "💡");
          return;
        }
        const hintText = residentDialogues[resKey].hint;
        playTone(600);
        showToast(hintText, "💡");
      });
    }

    if (btnViHelp) {
      btnViHelp.addEventListener("click", () => {
        playTone(650);
        if (helpModal) helpModal.classList.remove("hidden");
      });
    }

    if (btnCloseHelp) {
      btnCloseHelp.addEventListener("click", () => {
        playTone(500);
        if (helpModal) helpModal.classList.add("hidden");
      });
    }

    if (btnStartInspection) {
      btnStartInspection.addEventListener("click", () => {
        playTone(587.33);
        if (introModal) introModal.classList.add("hidden");
        focusResident(null); // 開場進入全景引導模式
      });
    }

    // 成果彈窗操作
    if (btnViewVenue) {
      btnViewVenue.addEventListener("click", () => {
        playTone(440);
        venueInspectorState.isReviewingVenue = true;
        if (victoryModal) victoryModal.classList.add("hidden");
        if (btnReturnSummary) btnReturnSummary.classList.remove("hidden");
        showToast("自由瀏覽婚禮場地中，隨時可點擊右下角查看成果！", "👀");
      });
    }

    if (btnReturnSummary) {
      btnReturnSummary.addEventListener("click", () => {
        playTone(523.25);
        if (victoryModal) victoryModal.classList.remove("hidden");
        btnReturnSummary.classList.add("hidden");
      });
    }

    if (btnReplay) {
      btnReplay.addEventListener("click", () => {
        playTone(440);
        venueInspectorState.completedTasks = { 1: false, 2: false, 3: false, 4: false };
        venueInspectorState.readNeeds = { crab: false, octopus: false, jellyfish: false, dolphin: false };
        venueInspectorState.itemPositions = { chair: "corridor-1", stand: "corridor-2", sign: "side-left" };
        venueInspectorState.selectedItem = null;
        venueInspectorState.signType = "gender_split";
        venueInspectorState.guestSeats = { octopus: null, octopus_friend: null };
        venueInspectorState.selectedGuest = null;
        venueInspectorState.lighting = { stageBrightness: "bright", seatBrightness: "bright", effect: "stable", direction: "seating" };
        venueInspectorState.photoState = { jumpSignRemoved: false, selectedPose: null, dolphinConfirmed: false, photoTaken: false };
        venueInspectorState.focusedResident = null;

        if (victoryModal) victoryModal.classList.add("hidden");
        if (btnReturnSummary) btnReturnSummary.classList.add("hidden");

        refreshVenueUI();
        focusResident(null);
        showToast("場地檢查已重設，重新開始挑戰！", "🔄");
      });
    }

    if (btnContinueStory) {
      btnContinueStory.addEventListener("click", () => {
        playTone(987.77);
        if (victoryModal) victoryModal.classList.add("hidden");
        goToUnit(11);
      });
    }

    venueInspectorResetIntro = function() {
      const allDone = venueInspectorState.completedTasks[1] &&
                      venueInspectorState.completedTasks[2] &&
                      venueInspectorState.completedTasks[3] &&
                      venueInspectorState.completedTasks[4];
      if (!allDone && introModal) {
        introModal.classList.remove("hidden");
      }
    };

    // 初次初始化渲染
    refreshVenueUI();
    focusResident(null); // 初始全景引導模式
    window.addEventListener("resize", syncItemPositions);
  }


  // ------------------------------------------
  // 【單元 11】彩虹泡泡煙火點擊
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
  // 【關卡 5・單元 12】小海兔星空手帳與證書
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
    ctx.fillText("亮亮、閃閃與波光城的朋友們 敬贈", canvas.width / 2, 480);
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
