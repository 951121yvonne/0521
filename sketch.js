let video, handPose, hands = [];
let gameState = "START", score = 0, currentQ = 0, feedbackText = "", feedbackColor;
let currentMagnet = null;
let dropZones = [];

// 手勢鎖定計時器
let gestureTimer = 0;
let lastGesture = 0;
const CONFIRM_TIME = 15; // 維持手勢約 0.5 秒來鎖定答案

// 艾瑞克森 20 題完整題庫
const questions = [
  {
    q: "Q1. 媽媽總是能及時餵飽哭泣的嬰兒，並給予溫暖的擁抱與撫慰。根據艾瑞克森的理論，此時嬰兒最可能發展出下列哪一種品質？",
    opts: ["(A) 自主性", "(B) 信任感", "(C) 自動自發", "(D) 勤奮感"],
    ans: 1,
    exp: "解析：嬰兒期（0-1.5歲）需求被穩定滿足，能建立對人與環境的「信任感」。"
  },
  {
    q: "Q2. 2 歲的小明最近喜歡嘗試自己穿鞋子，雖然常常穿反，但媽媽依然耐心地鼓勵他、讓他自己練習。小明此時正在經歷哪一個階段的發展危機？",
    opts: ["(A) 信任對不信任", "(B) 自動自發對罪惡感", "(C) 自主自立對羞怯懷疑", "(D) 勤奮進取對自卑感"],
    ans: 2,
    exp: "解析：幼兒期（1.5-3歲）開始探索身體控制，嘗試自己做決定，屬於「自主自立對羞怯懷疑」階段。"
  },
  {
    q: "Q3. 當幼兒嘗試自己拿湯匙吃飯而弄得滿地都是時，若照顧者過度斥責、表現出不耐煩並強行餵食，容易導致幼兒產生何種心理傾向？",
    opts: ["(A) 不信任感", "(B) 羞怯與懷疑", "(C) 罪惡感", "(D) 自卑感"],
    ans: 1,
    exp: "解析：幼兒期（1.5-3歲）若自主嘗試遭受過度挫折、限制或羞辱，容易產生「羞怯與懷疑」。"
  },
  {
    q: "Q4. 5 歲的小華喜歡在客廳用積木蓋「太空基地」，並興奮地向家人展示。如果父母此時經常責罵他「每天都把客廳弄得亂七八糟、很煩人」，小華可能會產生什麼心理衝突？",
    opts: ["(A) 罪惡感", "(B) 自卑感", "(C) 角色混淆", "(D) 孤立感"],
    ans: 0,
    exp: "解析：學齡前期（3-6歲）喜歡主動想像、創造與計畫，若其主動行為被視為搗蛋或麻煩，會產生「罪惡感」。"
  },
  {
    q: "Q5. 幼兒園舉辦變裝派對，4 歲的妞妞主動提出要扮演恐龍，並自己規劃、剪貼道具。這主要展現了哪一個階段的積極發展特徵？",
    opts: ["(A) 自主自立", "(B) 自動自發", "(C) 勤奮進取", "(D) 自我認同"],
    ans: 1,
    exp: "解析：學齡前期（3-6歲）主動規劃派對角色與道具，是「自動自發（Initiative）」的正面表現。"
  },
  {
    q: "Q6. 國小三年級的阿豪在學校的數學小考成績不理想，覺得自己怎麼學都比不上同學，因而漸漸失去學習興趣與自信。阿豪此時面臨的發展危機是：",
    opts: ["(A) 自主自立對羞怯懷疑", "(B) 自動自發對罪惡感", "(C) 勤奮進取對自卑感", "(D) 自我認同對角色混淆"],
    ans: 2,
    exp: "解析：學齡期（6-12歲）進入學校系統，主要任務是透過課業與生活技能學習建立能力，失敗易導致「自卑感」。"
  },
  {
    q: "Q7. 在艾瑞克森的理論中，哪一個時期的個體開始將注意力從家庭大幅轉移到學校與同儕，並透過學習課業與生活技能來獲得成就感？",
    opts: ["(A) 幼兒期", "(B) 學齡前期", "(C) 學齡期", "(D) 青少年期"],
    ans: 2,
    exp: "解析：學齡期（6-12歲）的核心環境由家庭擴展至學校，勤奮學習技能、獲得成就是此時期的重心。"
  },
  {
    q: "Q8. 16 歲的婷婷最近常思考「我是誰？」、「我未來想做什麼？」，並嘗試不同的穿衣風格與參與不同的社團。這反映了下列哪一個發展任務？",
    opts: ["(A) 自我認同（統合）", "(B) 親密感", "(C) 自動自發", "(D) 生產建設"],
    ans: 0,
    exp: "解析：青少年期（12-18歲）探索「我是誰」以及未來個人定位，屬於追求「自我認同（統合）」的階段。"
  },
  {
    q: "Q9. 小強上了高中後，一下子想當工程師，一下子又想休學去做音樂，對於未來的職業目標與個人價值觀感到非常茫然與焦慮。這屬於下列哪一種狀況？",
    opts: ["(A) 罪惡感", "(B) 自卑感", "(C) 角色混淆", "(D) 停滯感"],
    ans: 2,
    exp: "解析：青少年期（12-18歲）對未來目標搖擺不定、無法成功整合多重角色，是典型的「角色混淆」現象。"
  },
  {
    q: "Q10. 大學畢業的阿誠雖然渴望談戀愛，但因為害怕在親密關係中受傷或失去自我，總是與他人保持距離，甚至逃避社交。阿誠在成年早期可能面臨了什麼危機？",
    opts: ["(A) 角色混淆", "(B) 孤立感", "(C) 停滯感", "(D) 絕望感"],
    ans: 1,
    exp: "解析：成年早期（18-40歲）的核心任務是建立深度的親密關係，失敗或選擇逃避則會帶來「孤立感」。"
  },
  {
    q: "Q11. 艾瑞克森認為，個體若要成功建立「親密感」，通常必須先在前面哪一個階段打下良好的發展基礎？",
    opts: ["(A) 自主自立", "(B) 勤奮進取", "(C) 自我認同", "(D) 生產建設"],
    ans: 2,
    exp: "解析：必須先知道「自己是誰（自我認同）」，才能在不失去自我的前提下與他人融合，建立「親密感」。"
  },
  {
    q: "Q12. 50 歲的陳經理除了在工作上盡心提攜後進，工作之餘也積極參與社會公益、輔導中輟生，希望為下一代創造更好的環境。陳經理展現了哪一個階段的良好發展？",
    opts: ["(A) 自我認同", "(B) 親密感", "(C) 生產建設", "(D) 自我統合"],
    ans: 2,
    exp: "解析：成年中期（40-65歲）關注焦點延伸到下一代福祉與社會傳承，是「生產建設（Generativity）」的良好表現。"
  },
  {
    q: "Q13. 45 歲的張先生覺得生活一成不變，工作缺乏熱情，對社會和下一代的事情也漠不關心，每天只想著混日子。張先生正處於什麼樣的心理危機？",
    opts: ["(A) 角色混淆", "(B) 孤立感", "(C) 停滯感", "(D) 絕望感"],
    ans: 2,
    exp: "解析：成年中期（40-65歲）若生活失去目標，對社會或後代毫無奉獻或傳承想法，會陷入「停滯感」。"
  },
  {
    q: "Q14. 80 歲的林奶奶回顧自己的一生，雖然經歷過不少挫折與遺憾，但整體而言覺得自己活得很有價值，能坦然面對老去與死亡。林奶奶達成了哪一種心理社會品質？",
    opts: ["(A) 信任", "(B) 勤奮", "(C) 自我統合", "(D) 生產建設"],
    ans: 2,
    exp: "解析：成年晚期（65歲以上）回顧一生感到圓滿、無悔並能坦然接受生命，即達成「自我統合（Integrity）」。"
  },
  {
    q: "Q15. 許多高齡長者在退休後面臨臨終的關卡，若對過去的失敗決定充滿懊悔，覺得自己的一生虛度且無法重來，容易陷入哪種心理困境？",
    opts: ["(A) 自卑感", "(B) 角色混淆", "(C) 孤立感", "(D) 絕望感"],
    ans: 3,
    exp: "解析：成年晚期（65歲以上）若回顧一生充滿遺憾、痛恨過去決定且恐懼死亡，則會陷入「絕望感（Despair）」。"
  },
  {
    q: "Q16. 下列關於艾瑞克森發展階段與年齡區間的配對，何者錯誤？",
    opts: ["(A) 嬰兒期：信任對不信任", "(B) 學齡前期：勤奮進取對自卑", "(C) 青少年期：自我認同對混淆", "(D) 成年中期：生產建設對停滯"],
    ans: 1,
    exp: "解析：學齡前期（3-6歲）對應的應是「自動自發對罪惡感」；「勤奮進取對自卑感」為學齡期（6-12歲）的任務。"
  },
  {
    q: "Q17. 艾瑞克森認為，若個體在第一階段「信任對不信任」順利通過危機，將會轉化出哪一種重要的人格美德？",
    opts: ["(A) 希望（Hope）", "(B) 意志（Will）", "(C) 目的（Purpose）", "(D) 能力（Competence）"],
    ans: 0,
    exp: "解析：第一階段（信任對不信任）成功解決，個體會獲得對生命抱持樂觀信賴的「希望（Hope）」美德。"
  },
  {
    q: "Q18. 當個體在青少年期成功確立了「自我認同」，他所獲得的人格美德或核心力量是：",
    opts: ["(A) 忠誠（Fidelity）", "(B) 愛（Love）", "(C) 關懷（Care）", "(D) 智慧（Wisdom）"],
    ans: 0,
    exp: "解析：第五階段（自我認同時期）成功確立後，所獲得的核心美德為「忠誠（Fidelity）」（對自己價值的忠實）。"
  },
  {
    q: "Q19. 關於艾瑞克森的心理社會發展理論，下列敘述何者正確？",
    opts: ["(A) 危機沒解決就永遠無法彌補", "(B) 發展危機純然負面應避免", "(C) 危機解決是在兩極間取平衡", "(D) 成年後發展受生物因素支配"],
    ans: 2,
    exp: "解析：艾瑞克森強調健全人格是在正負兩極間取得健康平衡（例如：保有適度懷疑以自我保護，但以信任為主軸）。"
  },
  {
    q: "Q20. 下列何者不是青少年期（自我認同對角色混淆）個體主要的發展課題？",
    opts: ["(A) 探索職業興趣與未來方向", "(B) 確立自己的價值觀與信念", "(C) 建立深度的親密伴侶關係", "(D) 整合過去自我與多重角色"],
    ans: 2,
    exp: "解析：建立深度的親密伴侶關係（如婚姻或伴侶穩定關係）屬於下一個階段「成年早期」的核心任務。"
  }
];

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(800, 500);
  frameRate(30);
  video = createCapture(VIDEO);
  video.size(800, 500);
  video.hide();
  handPose.detectStart(video, (results) => { hands = results; });

  // 📐 放大並微調左側四個選項格子的位置與尺寸
  for (let i = 0; i < 4; i++) {
    dropZones.push({ x: 20, y: 30 + i * 110, w: 250, h: 95, label: "", num: i + 1 });
  }
}

function draw() {
  background(30);

  // 1. 鏡像繪製鏡頭視訊
  push();
  translate(width, 0); scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (gameState === "START") drawStart();
  else if (gameState === "PLAY") drawPlay();
  else if (gameState === "END") drawEnd();
}

function drawPlay() {
  fill(0, 0, 0, 160); rect(0, 0, width, height);

  let qData = questions[currentQ];

  // 🟦 繪製左側的選項區 (加入左上對齊與行距設定)
  push();
  for (let i = 0; i < 4; i++) {
    dropZones[i].label = `[ ${i+1} ]  ` + qData.opts[i];
    let z = dropZones[i];
    
    // 選項框
    fill(255, 223, 0, 40); stroke(255, 223, 0); strokeWeight(2);
    rect(z.x, z.y, z.w, z.h, 10);
    
    // 選項文字
    fill(255); noStroke(); 
    textAlign(LEFT, TOP);   // 強制從左上角開始排版，避免文字置中導致上下溢出
    textSize(16); 
    textLeading(22);        // 設定行距
    // 預留 padding，讓文字不會貼緊邊框
    text(z.label, z.x + 15, z.y + 15, z.w - 30, z.h - 20);
  }
  pop();

  // 🟪 顯示右上角的題目敘述區 (加寬加高，避免文字跑掉)
  push();
  fill(20, 30, 40, 200); stroke(255); strokeWeight(1);
  rect(290, 30, 490, 140, 10);
  
  fill(255); noStroke(); 
  textAlign(LEFT, TOP); 
  textSize(16); 
  textLeading(24); // 題目行距拉開，較易閱讀
  text(qData.q, 305, 45, 460, 120);
  pop();

  // 顯示上方計分與進度條
  push();
  fill(0, 255, 150); textSize(16); textAlign(LEFT, TOP);
  text(`得分: ${score} 分`, 300, 185);
  textAlign(RIGHT, TOP);
  text(`進度: ${currentQ + 1} / 20`, 770, 185);
  pop();

  // 手部偵測與手勢判斷
  if (hands.length > 0) {
    let hand = hands[0];
    let fingers = countFingers(hand);
    
    for (let pt of hand.keypoints) {
      fill(0, 223, 162); noStroke();
      ellipse(pt.x, pt.y, 7, 7);
    }

    if (currentMagnet && currentMagnet.state === "IDLE") {
      if (fingers >= 1 && fingers <= 4) {
        if (fingers === lastGesture) {
          gestureTimer++;
          drawProgressBar(hand.keypoints[0].x, hand.keypoints[0].y, gestureTimer / CONFIRM_TIME, fingers);
          
          if (gestureTimer >= CONFIRM_TIME) {
            currentMagnet.flyTo(fingers - 1);
            gestureTimer = 0;
          }
        } else {
          lastGesture = fingers;
          gestureTimer = 1;
        }
      } else {
        gestureTimer = 0;
        lastGesture = fingers;
      }
    }
  } else {
    gestureTimer = 0;
  }

  // 繪製與更新飛行的問題方塊
  if (currentMagnet) {
    currentMagnet.update();
    currentMagnet.display();
  }

  // 底部狀態文字提示
  push();
  fill(255); textAlign(CENTER, CENTER); textSize(18);
  text(feedbackText, 535, 460);
  pop();
}

function countFingers(hand) {
  let count = 0;
  let tips = [4, 8, 12, 16, 20];   
  let joints = [2, 6, 10, 14, 18]; 
  let wrist = hand.keypoints[0];

  for (let i = 0; i < 5; i++) {
    let dTip = dist(hand.keypoints[tips[i]].x, hand.keypoints[tips[i]].y, wrist.x, wrist.y);
    let dJoint = dist(hand.keypoints[joints[i]].x, hand.keypoints[joints[i]].y, wrist.x, wrist.y);
    if (dTip > dJoint * 1.25) count++;
  }
  return count;
}

function drawProgressBar(x, y, progress, number) {
  push();
  noFill(); stroke(0, 0, 0, 120); strokeWeight(8);
  ellipse(x, y, 80, 80);
  stroke(0, 255, 150); strokeWeight(8); strokeCap(ROUND);
  arc(x, y, 80, 80, -HALF_PI, -HALF_PI + TWO_PI * progress);
  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(24); textStyle(BOLD);
  text(number, x, y);
  pop();
}

function drawStart() {
  textAlign(CENTER, CENTER); fill(255); textSize(26); textLeading(40);
  text("人格發展心理學實驗室\n(舉起手掌，比出數字 1~4 進行作答)", width/2, height/2);
  if (hands.length > 0) { gameState = "PLAY"; spawnMagnet(); }
}

function drawEnd() {
  textAlign(CENTER, CENTER); fill(255); textSize(36);
  text(`測驗完成！總得分：${score} / 200 分`, width/2, height/2);
}

function spawnMagnet() {
  if (currentQ >= questions.length) { gameState = "END"; return; }
  currentMagnet = new MagnetBox(535, 290, `第 ${currentQ + 1} 題\n鎖定答案中...`, questions[currentQ].ans);
  feedbackText = "請看題，並對著鏡頭比出 1 ~ 4 手勢回答";
}

// 📦 問題答題方塊類別
class MagnetBox {
  constructor(x, y, text, ansIndex) {
    this.bx = x; this.by = y; this.x = x; this.y = y; this.text = text; this.ansIndex = ansIndex;
    this.state = "IDLE"; 
    this.targetZone = null;
    this.explTimer = 0;
    this.correctTimer = 0;
  }
  
  flyTo(zoneIndex) {
    this.targetZone = dropZones[zoneIndex];
    this.chosenIndex = zoneIndex;
    this.state = "FLYING";
    feedbackText = "答案傳送中...";
  }
  
  update() { 
    if (this.state === "FLYING") {
      let tx = this.targetZone.x + this.targetZone.w / 2;
      let ty = this.targetZone.y + this.targetZone.h / 2;
      this.x = lerp(this.x, tx, 0.2);
      this.y = lerp(this.y, ty, 0.2);
      
      if (dist(this.x, this.y, tx, ty) < 5) {
        if (this.chosenIndex === this.ansIndex) {
          score += 10;
          feedbackText = "正確！🎉";
          this.state = "CORRECT_PAUSE";
          this.correctTimer = 45; 
        } else {
          feedbackText = "答案錯誤！❌";
          this.state = "SHOW_EXPL";
          this.explTimer = 240; // 放長到 8 秒讓玩家看解析
        }
      }
    } 
    else if (this.state === "CORRECT_PAUSE") {
      this.correctTimer--;
      if (this.correctTimer <= 0) {
        currentQ++;
        spawnMagnet();
      }
    }
    else if (this.state === "SHOW_EXPL") {
      this.explTimer--;
      if (this.explTimer <= 0) {
        this.state = "RETURNING";
        feedbackText = "準備彈回重新作答...";
      }
    }
    else if (this.state === "RETURNING") {
      this.x = lerp(this.x, this.bx, 0.15);
      this.y = lerp(this.y, this.by, 0.15);
      
      if (dist(this.x, this.y, this.bx, this.by) < 5) {
        this.x = this.bx; this.y = this.by;
        this.state = "IDLE";
        feedbackText = "請重新比出 1 ~ 4 手勢作答";
      }
    }
  }
  
  display() {
    push();
    rectMode(CENTER);
    
    if (this.state === "FLYING") {
      fill(40, 60, 90, 220); stroke(0, 255, 150); strokeWeight(4);
    } else if (this.state === "SHOW_EXPL" || this.state === "RETURNING") {
      fill(120, 40, 40, 220); stroke(255, 50, 50); strokeWeight(4);
    } else if (this.state === "CORRECT_PAUSE") {
      fill(30, 90, 50, 220); stroke(0, 255, 100); strokeWeight(4);
    } else {
      fill(50, 55, 70); stroke(220); strokeWeight(2);
    }
    
    rect(this.x, this.y, 220, 90, 10);
    fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(18); textStyle(BOLD); textLeading(26);
    text(this.text, this.x, this.y);
    pop();

    // 💡 放大版的解析視窗，確保最長的解析文字也不會溢出
    if (this.state === "SHOW_EXPL") {
      push();
      rectMode(CENTER);
      fill(0, 0, 0, 120);
      rect(width/2, height/2, width, height); // 全螢幕遮罩
      
      // 解析卡片底板加寬加高 (660 x 260)
      fill(35, 38, 50, 245);
      stroke(255, 90, 90);
      strokeWeight(3);
      rect(width/2, height/2, 660, 260, 15);
      
      fill(255, 110, 110);
      textSize(24);
      textStyle(BOLD);
      textAlign(CENTER, TOP);
      text("答錯了！別灰心，來看看概念解析：", width/2, height/2 - 100);
      
      // 內文：強制左上角對齊，給予充分寬高
      fill(240);
      textSize(18);
      textStyle(NORMAL);
      textAlign(LEFT, TOP);
      textLeading(28); // 解析的行距調大，更舒適
      // (文字內容, x, y, 寬度, 高度)
      text(questions[currentQ].exp, width/2 - 300, height/2 - 50, 600, 160);
      
      // 下方的倒數計時進度條
      stroke(255, 90, 90, 100); strokeWeight(4);
      line(width/2 - 300, height/2 + 95, width/2 + 300, height/2 + 95);
      stroke(255, 90, 90);
      let progressWidth = map(this.explTimer, 0, 240, 0, 600);
      line(width/2 - 300, height/2 + 95, width/2 - 300 + progressWidth, height/2 + 95);
      pop();
    }
  }
}