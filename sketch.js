// ==========================================
// 艾瑞克森心理社會發展互動測驗 - 介面優化版 (修正完賽版)
// ==========================================
let video, handPose, hands = [];
let gameState = "START", score = 0, currentQ = 0, feedbackText = "";
let currentMagnet = null;

// 佈局變數 (集中管理，讓畫面不跑版)
let dropZones = [];
let layout = {}; 

let gestureTimer = 0;
let lastGesture = 0;
const CONFIRM_TIME = 15; // 偵測鎖定幀數

// 題庫 (完整 20 題)
const questions = [
  { q: "Q1. 媽媽總是能及時餵飽哭泣的嬰兒，並給予溫暖的擁抱與撫慰。此時嬰兒最可能發展出下列哪一種品質？", opts: ["(A) 自主性", "(B) 信任感", "(C) 自動自發", "(D) 勤奮感"], ans: 1, exp: "解析：嬰兒期（0-1.5歲）需求被穩定滿足，能建立對人與環境的「信任感」。" },
  { q: "Q2. 2歲的小明最近喜歡嘗試自己穿鞋子，雖然常常穿反，但媽媽依然耐心地鼓勵他。小明此時正在經歷哪一個發展危機？", opts: ["(A) 信任對不信任", "(B) 自動自發對罪惡感", "(C) 自主自立對羞怯懷疑", "(D) 勤奮進取對自卑感"], ans: 2, exp: "解析：幼兒期（1.5-3歲）開始探索身體控制，嘗試自己做決定，屬於「自主自立對羞怯懷疑」階段。" },
  { q: "Q3. 當幼兒嘗試自己拿湯匙吃飯弄得滿地都是時，若照顧者過度斥責並強行餵食，容易導致幼兒產生何種心理傾向？", opts: ["(A) 不信任感", "(B) 羞怯與懷疑", "(C) 罪惡感", "(D) 自卑感"], ans: 1, exp: "解析：幼兒期（1.5-3歲）若自主嘗試遭受過度挫折或羞辱，容易產生「羞怯與懷疑」。" },
  { q: "Q4. 5歲的小華喜歡用積木蓋太空基地，如果父母常責罵他「把客廳弄得亂七八糟」，小華可能會產生什麼心理衝突？", opts: ["(A) 罪惡感", "(B) 自卑感", "(C) 角色混淆", "(D) 孤立感"], ans: 0, exp: "解析：學齡前期（3-6歲）主動行為被視為搗蛋，會產生「罪惡感」。" },
  { q: "Q5. 4歲的妞妞主動提出要扮演恐龍，並自己規劃、剪貼道具。這主要展現了哪一個階段的積極發展特徵？", opts: ["(A) 自主自立", "(B) 自動自發", "(C) 勤奮進取", "(D) 自我認同"], ans: 1, exp: "解析：學齡前期（3-6歲）主動規劃角色與道具，是「自動自發」的正面表現。" },
  { q: "Q6. 國小三年級的阿豪數學成績不理想，覺得比不上同學而失去自信。阿豪此時面臨的發展危機是：", opts: ["(A) 自主自立對羞怯懷疑", "(B) 自動自發對罪惡感", "(C) 勤奮進取對自卑感", "(D) 自我認同對角色混淆"], ans: 2, exp: "解析：學齡期（6-12歲）主要任務是學習技能建立能力，失敗易導致「自卑感」。" },
  { q: "Q7. 在艾瑞克森理論中，哪一個時期個體注意力從家庭轉移到學校，透過學習課業與技能獲得成就感？", opts: ["(A) 幼兒期", "(B) 學齡前期", "(C) 學齡期", "(D) 青少年期"], ans: 2, exp: "解析：學齡期（6-12歲）核心環境由家庭擴展至學校，勤奮學習是重心。" },
  { q: "Q8. 16歲的婷婷常思考「我是誰？」並嘗試不同風格。這反映了下列哪一個發展任務？", opts: ["(A) 自我認同", "(B) 親密感", "(C) 自動自發", "(D) 生產建設"], ans: 0, exp: "解析：青少年期（12-18歲）探索個人定位，追求「自我認同」。" },
  { q: "Q9. 小強上高中後，對未來的職業目標與價值觀感到茫然與焦慮。這屬於下列哪一種狀況？", opts: ["(A) 罪惡感", "(B) 自卑感", "(C) 角色混淆", "(D) 停滯感"], ans: 2, exp: "解析：青少年期對未來目標搖擺不定、無法整合多重角色，是「角色混淆」。" },
  { q: "Q10. 大學畢業的阿誠害怕在親密關係中受傷，總是與他人保持距離，甚至逃避社交。阿誠面臨了什麼危機？", opts: ["(A) 角色混淆", "(B) 孤立感", "(C) 停滯感", "(D) 絕望感"], ans: 1, exp: "解析：成年早期（18-40歲）核心任務是建立親密關係，失敗則帶來「孤立感」。" },
  { q: "Q11. 若要成功建立「親密感」，通常必須先在前面哪一個階段打下良好的基礎？", opts: ["(A) 自主自立", "(B) 勤奮進取", "(C) 自我認同", "(D) 生產建設"], ans: 2, exp: "解析：必須先知道「自己是誰（自我認同）」，才能在不失去自我的前提下建立親密感。" },
  { q: "Q12. 50歲的陳經理提攜後進並參與社會公益，希望為下一代創造更好的環境。他展現了何種良好發展？", opts: ["(A) 自我認同", "(B) 親密感", "(C) 生產建設", "(D) 自我統合"], ans: 2, exp: "解析：成年中期（40-65歲）關注下一代福祉與傳承，是「生產建設」。" },
  { q: "Q13. 45歲的張先生覺得生活一成不變，對社會和下一代漠不關心，只想混日子。他處於什麼危機？", opts: ["(A) 角色混淆", "(B) 孤立感", "(C) 停滯感", "(D) 絕望感"], ans: 2, exp: "解析：成年中期若生活無目標、對社會無貢獻想法，會陷入「停滯感」。" },
  { q: "Q14. 80歲的林奶奶回顧一生覺得很有價值，能坦然面對老去與死亡。她達成了哪種心理品質？", opts: ["(A) 信任", "(B) 勤奮", "(C) 自我統合", "(D) 生產建設"], ans: 2, exp: "解析：成年晚期（65歲以上）回顧一生感到圓滿，即達成「自我統合」。" },
  { q: "Q15. 若高齡長者對過去的決定充滿懊悔，覺得一生虛度且無法重來，容易陷入哪種心理困境？", opts: ["(A) 自卑感", "(B) 角色混淆", "(C) 孤立感", "(D) 絕望感"], ans: 3, exp: "解析：成年晚期若回顧一生充滿遺憾、痛恨過去，則會陷入「絕望感」。" },
  { q: "Q16. 關於艾瑞克森發展階段與年齡區間的配對，何者錯誤？", opts: ["(A) 嬰兒期：信任對不信任", "(B) 學齡前期：勤奮對自卑", "(C) 青少年期：認同對混淆", "(D) 成年中期：生產對停滯"], ans: 1, exp: "解析：學齡前期（3-6歲）應是「自動自發對罪惡感」；學齡期才對應勤奮。" },
  { q: "Q17. 第一階段「信任對不信任」順利通過，將會轉化出哪一種重要的人格美德？", opts: ["(A) 希望", "(B) 意志", "(C) 目的", "(D) 能力"], ans: 0, exp: "解析：第一階段成功解決，個體會獲得對生命抱持樂觀的「希望」美德。" },
  { q: "Q18. 青少年期成功確立「自我認同」後，所獲得的核心美德是：", opts: ["(A) 忠誠", "(B) 愛", "(C) 關懷", "(D) 智慧"], ans: 0, exp: "解析：第五階段成功確立後，所獲得的核心美德為「忠誠」。" },
  { q: "Q19. 關於艾瑞克森心理社會發展理論，何者正確？", opts: ["(A) 危機沒解決就無法彌補", "(B) 發展危機應完全避免", "(C) 解決是在兩極間取平衡", "(D) 成年後受生物支配"], ans: 2, exp: "解析：人格是在正負兩極間取得健康平衡（例如保有適度懷疑，但以信任為主軸）。" },
  { q: "Q20. 下列何者「不是」青少年期（認同對混淆）主要的發展課題？", opts: ["(A) 探索職業方向", "(B) 確立價值觀", "(C) 建立深度親密關係", "(D) 整合多重角色"], ans: 2, exp: "解析：建立深度的親密伴侶關係屬於下一個階段「成年早期」的核心任務。" }
];

function preload() { 
  handPose = ml5.handPose({ flipped: true }); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO); 
  video.size(windowWidth, windowHeight); 
  video.hide();
  
  handPose.detectStart(video, (results) => { hands = results; });
  calculateLayout(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
  calculateLayout(); 
}

function calculateLayout() {
  dropZones = [];
  let padding = 20;
  
  let optionHeight = (height * 0.85 - padding * 5) / 4; 
  for (let i = 0; i < 4; i++) {
    dropZones.push({ 
      x: width * 0.04, 
      y: height * 0.12 + i * (optionHeight + padding), 
      w: width * 0.35, 
      h: optionHeight 
    });
  }

  layout.qX = width * 0.42;
  layout.qY = height * 0.12;
  layout.qW = width * 0.54;
  layout.qH = height * 0.42;

  layout.lX = width * 0.42;
  layout.lY = height * 0.58;
  layout.lW = width * 0.54;
  layout.lH = height * 0.28;
}

function draw() {
  background(30);
  push(); 
  translate(width, 0); 
  scale(-1, 1); 
  image(video, 0, 0, width, height); 
  pop();
  
  if (gameState === "START") drawStart();
  else if (gameState === "PLAY") drawPlay();
  else if (gameState === "END") drawEnd();
}

function drawPlay() {
  fill(0, 0, 0, 175); 
  noStroke();
  rect(0, 0, width, height);
  
  let qData = questions[currentQ];

  // 1. 上方資訊欄
  fill(20, 30, 50, 240);
  stroke(0, 220, 255);
  strokeWeight(2);
  rect(0, 0, width, 80);
  
  fill(0, 255, 180);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(24);
  text(`得分: ${score}`, width * 0.05, 40);
  text(`進度: ${currentQ + 1} / ${questions.length}`, width * 0.35, 40);
  
  fill(255, 220, 100);
  text(`偵測手勢: ${lastGesture}`, width * 0.75, 40);

  // 2. 中央題目區
  fill(25, 35, 50, 220); 
  stroke(0, 200, 255); 
  strokeWeight(2); 
  rectMode(CORNER);
  rect(layout.qX, layout.qY, layout.qW, layout.qH, 12);
  
  // 核心修正：利用自動換行函數編譯題目，避免溢出
  let wrappedQ = wrapChineseText(qData.q, layout.qW - 50, 24);
  fill(255); 
  noStroke(); 
  textAlign(LEFT, TOP); 
  textSize(24);
  textLeading(38);
  text(wrappedQ, layout.qX + 25, layout.qY + 25);

  // 3. 左側選項框
  for (let i = 0; i < 4; i++) {
    let z = dropZones[i];
    fill(255, 223, 0, 35); 
    stroke(255, 223, 0); 
    strokeWeight(2);
    rect(z.x, z.y, z.w, z.h, 12);
    
    fill(255, 223, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(28);
    text(i + 1, z.x + 40, z.y + z.h / 2);
    
    // 選項也加入安全防線自動換行
    let wrappedOpt = wrapChineseText(qData.opts[i], z.w - 110, 20);
    fill(255); 
    textAlign(LEFT, CENTER); 
    textSize(20); 
    textLeading(30);
    text(wrappedOpt, z.x + 80, z.y + z.h / 2);
  }

  // 4. 右側手勢鎖定區
  fill(30, 50, 70, 220);
  stroke(100, 220, 150);
  strokeWeight(2);
  rect(layout.lX, layout.lY, layout.lW, layout.lH, 12);
  
  fill(100, 220, 150);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(22);
  text("手勢鎖定區", layout.lX + layout.lW / 2, layout.lY + 15);

  // 5. 手勢偵測
  let isShowingExpl = (currentMagnet && currentMagnet.state === "EXPL");
  if (hands.length > 0 && !isShowingExpl) {
    let fingers = countFingers(hands[0]);
    if (currentMagnet && currentMagnet.state === "IDLE" && fingers >= 1 && fingers <= 4) {
      if (fingers === lastGesture) {
        gestureTimer++;
        drawProgressBar(hands[0].keypoints[0].x, hands[0].keypoints[0].y, gestureTimer / CONFIRM_TIME, fingers);
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
    }
  }

  if (currentMagnet) { 
    currentMagnet.update(); 
    currentMagnet.display(); 
  }
  
  // 6. 底部狀態列
  if (!isShowingExpl) {
    fill(0, 0, 0, 200);
    rect(0, height - 60, width, 60);
    fill(255); 
    textAlign(CENTER, CENTER); 
    textSize(20);
    text(feedbackText, width / 2, height - 30);
  }
}

function countFingers(hand) {
  let count = 0;
  let wrist = hand.keypoints[0];
  let tips = [8, 12, 16, 20];
  let joints = [6, 10, 14, 18];
  
  for (let i = 0; i < 4; i++) {
    let dTip = dist(hand.keypoints[tips[i]].x, hand.keypoints[tips[i]].y, wrist.x, wrist.y);
    let dJoint = dist(hand.keypoints[joints[i]].x, hand.keypoints[joints[i]].y, wrist.x, wrist.y);
    if (dTip > dJoint * 1.05) count++; 
  }
  
  let thumbTip = hand.keypoints[4];
  let thumbMcp = hand.keypoints[2];
  let indexBase = hand.keypoints[5];
  let dThumb = dist(thumbTip.x, thumbTip.y, indexBase.x, indexBase.y);
  let dThumbJoint = dist(thumbMcp.x, thumbMcp.y, indexBase.x, indexBase.y);
  if (dThumb > dThumbJoint * 1.1) count++; 
  
  return count;
}

function drawProgressBar(x, y, progress, num) {
  push(); 
  noFill(); 
  stroke(0, 255, 150); 
  strokeWeight(8); 
  arc(x, y, 85, 85, -HALF_PI, -HALF_PI + TWO_PI * progress);
  fill(255); 
  noStroke(); 
  textAlign(CENTER, CENTER); 
  textSize(34); 
  text(num, x, y); 
  pop();
}

function drawStart() { 
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);
  
  textAlign(CENTER, CENTER); 
  fill(255, 223, 0); 
  textSize(min(width * 0.05, 48)); 
  text("艾瑞克森心理社會發展互動測驗", width / 2, height / 2 - 80);
  
  fill(0, 220, 255);
  textSize(min(width * 0.03, 32));
  text("Erikson Psychosocial Development Test", width / 2, height / 2);
  
  fill(255);
  textSize(28);
  text("舉起手掌即可開始測驗", width / 2, height / 2 + 100);
  
  push();
  translate(width / 2, height / 2 + 180);
  noFill();
  stroke(0, 220, 255);
  strokeWeight(3);
  let s = sin(frameCount * 0.05) * 15;
  circle(0, 0, 80 + s);
  pop();
  
  if (hands.length > 0) { gameState = "PLAY"; spawnMagnet(); } 
}

function drawEnd() { 
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);
  
  textAlign(CENTER, CENTER); 
  fill(0, 255, 150); 
  textSize(56);
  text("測驗完成！", width / 2, height / 2 - 80);
  
  fill(255);
  textSize(40);
  text(`您的總得分：${score} 分`, width / 2, height / 2 + 20);
  
  fill(100, 220, 150);
  textSize(24);
  text("按 F5 或重新整理頁面開始新測驗", width / 2, height / 2 + 120);
}

function spawnMagnet() { 
  if (currentQ >= questions.length) { 
    gameState = "END"; 
    return; 
  } 
  let startX = layout.lX + layout.lW / 2;
  let startY = layout.lY + layout.lH / 2 + 20;
  currentMagnet = new MagnetBox(startX, startY, "鎖定答案", questions[currentQ].ans); 
  feedbackText = "比出 1 ~ 4 手勢進行答題"; 
}

// 答案磁吸盒類別
class MagnetBox {
  constructor(x, y, t, ans) { 
    this.bx = x; this.by = y; 
    this.x = x; this.y = y; 
    this.t = t; this.ans = ans; 
    this.state = "IDLE"; 
  }
  
  flyTo(i) { 
    this.target = dropZones[i]; 
    this.chosen = i; 
    this.state = "FLYING"; 
  }
  
  update() {
    if (this.state === "FLYING") {
      let targetX = this.target.x + this.target.w / 2;
      let targetY = this.target.y + this.target.h / 2;
      this.x = lerp(this.x, targetX, 0.2); 
      this.y = lerp(this.y, targetY, 0.2);
      
      if (dist(this.x, this.y, targetX, targetY) < 5) {
        if (this.chosen === this.ans) { 
          score += 10; 
          feedbackText = "正確！"; 
          this.state = "PAUSE"; 
          setTimeout(() => { currentQ++; spawnMagnet(); }, 1500); 
        } else { 
          feedbackText = "錯誤！"; 
          this.state = "EXPL"; 
          setTimeout(() => { currentQ++; spawnMagnet(); }, 5000); 
        }
      }
    }
  }
  
  display() {
    push(); 
    rectMode(CENTER); 
    fill(50, 65, 85); 
    stroke(255); 
    strokeWeight(2); 
    rect(this.x, this.y, 180, 70, 10);
    fill(255); 
    noStroke();
    textAlign(CENTER, CENTER); 
    textSize(20); 
    text(this.t, this.x, this.y); 
    pop();
    
    // 核心修正：全面重製的解析面板，絕對完美置中且絕不出框
    if (this.state === "EXPL") {
      push();
      rectMode(CORNER);
      fill(0, 0, 0, 220); 
      rect(0, 0, width, height); 
      
      rectMode(CENTER); 
      fill(30, 40, 55, 240);
      stroke(255, 110, 110);
      strokeWeight(3);
      
      let panelW = min(720, width * 0.9);
      let panelH = 360;
      rect(width / 2, height / 2, panelW, panelH, 15);
      
      // 標題
      textAlign(CENTER, CENTER); 
      fill(255, 110, 110);
      noStroke();
      textSize(24);
      text("答錯了！別灰心，來看看概念解析：", width / 2, height / 2 - 100);
      
      // 核心解析內容：利用 CJK 編譯器強制將長中文斷行
      let wrappedExp = wrapChineseText(questions[currentQ].exp, panelW - 100, 20);
      fill(255);
      textSize(20);
      textLeading(34);
      // 精準定位：利用 3 參數模式將已預換行的段落，在背景框中心點下方做塊狀垂直水平置中
      text(wrappedExp, width / 2, height / 2 + 30);
      pop();
    }
  }
}

// =======================================================
// ⚡ 核心解藥：針對 p5.js 中文不支援自動斷行所寫的 CJK 編譯器
// =======================================================
function wrapChineseText(txt, maxWidth, fontSize) {
  push();
  textSize(fontSize); 
  let result = "";
  let currentLine = "";
  
  for (let i = 0; i < txt.length; i++) {
    let char = txt.charAt(i);
    if (char === '\n') {
      result += currentLine + '\n';
      currentLine = "";
      continue;
    }
    
    let testLine = currentLine + char;
    // 如果加上這個字會超出框框最大寬度，就強制推入換行符號
    if (textWidth(testLine) > maxWidth) {
      result += currentLine + '\n';
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  result += currentLine; 
  pop();
  return result;
}