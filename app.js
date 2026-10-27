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
    if (unitNum === 4) initLevel1Spotlight();
    if (unitNum === 6) initLevel2Bubbles();
    if (unitNum === 8) initLevel3Salon();
    if (unitNum === 10) initLevel4StageDeco();
    if (unitNum === 11) initLevel5Weave();
    if (unitNum === 12) initUnit12Fireworks();
    if (unitNum === 13) initLevel6Reflection();
  }

  // ------------------------------------------
  // 【關卡 1・單元 4】深海聚光燈
  // ------------------------------------------
  let spotlightInited = false;
  function initLevel1Spotlight() {
    if (spotlightInited) return;
    spotlightInited = true;

    const canvas = document.getElementById("spotlight-canvas");
    const stage = document.getElementById("spotlight-stage");
    const ctx = canvas.getContext("2d");
    const countDisplay = document.getElementById("spotlight-found-count");
    const modal = document.getElementById("nature-card-modal");
    const modalTitle = document.getElementById("modal-creature-title");
    const modalFact = document.getElementById("modal-creature-fact");
    const btnCloseModal = document.getElementById("btn-close-creature-modal");

    function resizeCanvas() {
      canvas.width = stage.clientWidth;
      canvas.height = stage.clientHeight;
      drawDarkMask(-1000, -1000);
    }
    window.addEventListener("resize", resizeCanvas);
    setTimeout(resizeCanvas, 100);

    function drawDarkMask(x, y) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(7, 15, 28, 0.94)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "destination-out";
      const radGrad = ctx.createRadialGradient(x, y, 20, x, y, 140);
      radGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    stage.addEventListener("mousemove", (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      drawDarkMask(x, y);
    });

    document.querySelectorAll(".hidden-creature").forEach(creature => {
      creature.addEventListener("click", () => {
        const name = creature.dataset.name;
        const fact = creature.dataset.fact;
        state.spotlightFound.add(name);
        countDisplay.textContent = state.spotlightFound.size;
        
        modalTitle.textContent = `🌟 ${name}`;
        modalFact.textContent = fact;
        modal.classList.remove("hidden");
        playTone(659.25); // E5

        if (state.spotlightFound.size === 4) {
          playTone(783.99); // G5
        }
      });
    });

    btnCloseModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  // ------------------------------------------
  // 【關卡 2・單元 6】思維泡泡戳戳樂
  // ------------------------------------------
  let bubblesInited = false;
  function initLevel2Bubbles() {
    if (bubblesInited) return;
    bubblesInited = true;

    const pearls = document.querySelectorAll(".draggable-pearl");
    const targets = document.querySelectorAll(".bubble-target");
    const feedback = document.getElementById("bubble-feedback");

    pearls.forEach(pearl => {
      pearl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", pearl.dataset.type);
      });
    });

    targets.forEach(target => {
      target.addEventListener("dragover", (e) => {
        e.preventDefault();
        target.classList.add("drag-over");
      });

      target.addEventListener("dragleave", () => {
        target.classList.remove("drag-over");
      });

      target.addEventListener("drop", (e) => {
        e.preventDefault();
        target.classList.remove("drag-over");
        const pearlType = e.dataTransfer.getData("text/plain");
        const acceptType = target.dataset.accept;

        if (pearlType === acceptType) {
          target.classList.add("resolved");
          state.bubblesResolved.add(acceptType);
          playTone(880); // A5

          if (acceptType === "color") {
            target.querySelector(".bubble-content").innerHTML = "🌈 <strong>解開迷思！</strong><br>顏色是大自然的禮物，沒有任何顏色專屬於特定性別！";
          } else if (acceptType === "trait") {
            target.querySelector(".bubble-content").innerHTML = "🌸 <strong>解開迷思！</strong><br>溫柔體貼是美好的特質，每個人都可以自由展現！";
          } else if (acceptType === "binary") {
            target.querySelector(".bubble-content").innerHTML = "✨ <strong>解開迷思！</strong><br>愛的形狀不只一種，彼此珍惜與扶持才是最重要的！";
          }

          if (state.bubblesResolved.size === 3) {
            feedback.innerHTML = "🎉 太棒了！你解開了所有居民的心結，波光城充滿了理解與溫暖！";
          } else {
            feedback.textContent = `已成功解開 ${state.bubblesResolved.size} / 3 個思維泡泡！`;
          }
        } else {
          feedback.textContent = "💡 試著想想看：這顆同理珍珠最適合回應哪一種疑問呢？再試試看！";
        }
      });
    });
  }

  // ------------------------------------------
  // 【關卡 3・單元 8】無界限造型沙龍
  // ------------------------------------------
  let salonInited = false;
  const wardrobeData = {
    hats: [
      { id: "hat-top", name: "珊瑚高帽", icon: "🎩" },
      { id: "hat-veil", name: "星光頭紗", icon: "👰" },
      { id: "hat-crown", name: "貝殼花冠", icon: "👑" }
    ],
    clothes: [
      { id: "cloth-suit", name: "深海西裝", icon: "🤵" },
      { id: "cloth-gown", name: "浪花長禮服", icon: "👗" },
      { id: "cloth-cape", name: "珍珠斗篷", icon: "🦹" }
    ]
  };

  function initLevel3Salon() {
    if (salonInited) return;
    salonInited = true;

    const wardrobeItems = document.getElementById("wardrobe-items");
    const tabs = document.querySelectorAll(".wardrobe-tabs .tab-btn");
    let currentCategory = "hats";

    function renderWardrobe(cat) {
      wardrobeItems.innerHTML = "";
      wardrobeData[cat].forEach(item => {
        const card = document.createElement("div");
        card.className = "cloth-item-card";
        card.innerHTML = `<span class="icon">${item.icon}</span><span class="name">${item.name}</span>`;
        
        card.addEventListener("click", () => {
          if (!state.liangOutfit[cat === "hats" ? "hat" : "cloth"]) {
            equipToCharacter("liang", cat, item);
          } else {
            equipToCharacter("shan", cat, item);
          }
          playTone(700);
        });
        wardrobeItems.appendChild(card);
      });
    }

    function equipToCharacter(target, cat, item) {
      if (cat === "hats") {
        document.getElementById(`equip-${target}-hat`).textContent = item.icon;
        state[`${target}Outfit`].hat = item.name;
      } else {
        document.getElementById(`equip-${target}-cloth`).textContent = item.icon;
        state[`${target}Outfit`].cloth = item.name;
      }
      document.getElementById(`${target}-outfit-text`).textContent = 
        `${state[`${target}Outfit`].hat || "自選"} + ${state[`${target}Outfit`].cloth || "自選"}`;
    }

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.tab;
        renderWardrobe(currentCategory);
      });
    });

    renderWardrobe("hats");

    document.getElementById("btn-reset-outfit").addEventListener("click", () => {
      state.liangOutfit = { hat: null, cloth: null };
      state.shanOutfit = { hat: null, cloth: null };
      document.getElementById("equip-liang-hat").textContent = "";
      document.getElementById("equip-liang-cloth").textContent = "";
      document.getElementById("equip-shan-hat").textContent = "";
      document.getElementById("equip-shan-cloth").textContent = "";
      document.getElementById("liang-outfit-text").textContent = "原本的自己";
      document.getElementById("shan-outfit-text").textContent = "原本的自己";
    });

    const popup = document.getElementById("salon-popup");
    const polaroid = document.getElementById("polaroid-content");
    document.getElementById("btn-save-outfit").addEventListener("click", () => {
      polaroid.innerHTML = `
        <div style="font-size: 54px; margin-bottom: 8px;">
          ${document.getElementById("equip-liang-hat").textContent || "🎩"}
          ${document.getElementById("equip-shan-hat").textContent || "👰"}
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #0284c7;">
          亮亮與閃閃的專屬盛裝
        </div>
      `;
      popup.classList.remove("hidden");
      playTone(800);
    });

    document.getElementById("btn-close-salon-popup").addEventListener("click", () => {
      popup.classList.add("hidden");
      goToUnit(9);
    });
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

    document.getElementById("node-lights").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#fef08a";
      playTone(587.33);
      addHarmony(30);
    });

    document.getElementById("node-music").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#fed7aa";
      playTone(659.25);
      addHarmony(30);
    });

    document.getElementById("node-carpet").addEventListener("click", (e) => {
      e.currentTarget.style.background = "#a7f3d0";
      playTone(783.99);
      addHarmony(20);
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

  // 預設進入第一單元
  goToUnit(1);
});
