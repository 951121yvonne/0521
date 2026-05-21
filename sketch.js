let video, handPose, hands = [];
let gameState = "START", score = 0, currentQ = 0, feedbackText = "";
let currentMagnet = null;
let dropZones = [];

let gestureTimer = 0;
let lastGesture = 0;
const CONFIRM_TIME = 15;

// 題庫 (解析內容已縮短並針對框框寬度調整)
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

function preload() { handPose = ml5.handPose({ flipped: true }); }

function setup() {
  createCanvas(800, 500);
  video = createCapture(VIDEO); video.size(800, 500); video.hide();
  handPose.detectStart(video, (results) => { hands = results; });
  for (let i = 0; i < 4; i++) dropZones.push({ x: 20, y: 30 + i * 110, w: 250, h: 95 });
}

function draw() {
  background(30);
  push(); translate(width, 0); scale(-1, 1); image(video, 0, 0, width, height); pop();
  if (gameState === "START") drawStart();
  else if (gameState === "PLAY") drawPlay();
  else if (gameState === "END") drawEnd();
}

function drawPlay() {
  fill(0, 0, 0, 160); rect(0, 0, width, height);
  let qData = questions[currentQ];

  // 繪製左側選項
  for (let i = 0; i < 4; i++) {
    let z = dropZones[i];
    fill(255, 223, 0, 40); stroke(255, 223, 0); strokeWeight(2);
    rect(z.x, z.y, z.w, z.h, 10);
    fill(255); noStroke(); textAlign(LEFT, TOP); textSize(15); textLeading(18);
    text(`${i+1}. ${qData.opts[i]}`, z.x + 15, z.y + 15, z.w - 30, z.h - 30);
  }

  // 繪製右上題目
  fill(20, 30, 40, 200); stroke(255); strokeWeight(1); rect(290, 30, 490, 140, 10);
  fill(255); noStroke(); textAlign(LEFT, TOP); textSize(16); textLeading(22);
  text(qData.q, 305, 45, 460, 110);

  // 繪製進度
  fill(0, 255, 150); text(`得分: ${score}  進度: ${currentQ + 1}/20`, 305, 180);

  if (hands.length > 0) {
    let fingers = countFingers(hands[0]);
    if (currentMagnet && currentMagnet.state === "IDLE" && fingers >= 1 && fingers <= 4) {
      if (fingers === lastGesture) {
        gestureTimer++;
        drawProgressBar(hands[0].keypoints[0].x, hands[0].keypoints[0].y, gestureTimer/CONFIRM_TIME, fingers);
        if (gestureTimer >= CONFIRM_TIME) { currentMagnet.flyTo(fingers - 1); gestureTimer = 0; }
      } else { lastGesture = fingers; gestureTimer = 1; }
    } else { gestureTimer = 0; }
  }

  if (currentMagnet) { currentMagnet.update(); currentMagnet.display(); }
  fill(255); textAlign(CENTER, CENTER); text(feedbackText, 535, 460);
}

function countFingers(hand) {
  let count = 0;
  let tips = [4, 8, 12, 16, 20], joints = [2, 6, 10, 14, 18], wrist = hand.keypoints[0];
  for (let i = 0; i < 5; i++) {
    if (dist(hand.keypoints[tips[i]].x, hand.keypoints[tips[i]].y, wrist.x, wrist.y) > dist(hand.keypoints[joints[i]].x, hand.keypoints[joints[i]].y, wrist.x, wrist.y) * 1.25) count++;
  }
  return count;
}

function drawProgressBar(x, y, progress, num) {
  push(); noFill(); stroke(0,255,150); strokeWeight(8); arc(x, y, 80, 80, -HALF_PI, -HALF_PI + TWO_PI * progress);
  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(30); text(num, x, y); pop();
}

function drawStart() { textAlign(CENTER, CENTER); fill(255); text("舉起手掌開始測驗", width/2, height/2); if (hands.length > 0) { gameState = "PLAY"; spawnMagnet(); } }
function drawEnd() { textAlign(CENTER, CENTER); fill(255); text(`測驗完成！總得分：${score}`, width/2, height/2); }
function spawnMagnet() { if (currentQ >= questions.length) { gameState = "END"; return; } currentMagnet = new MagnetBox(535, 290, "鎖定答案", questions[currentQ].ans); feedbackText = "比 1-4 手勢回答"; }

class MagnetBox {
  constructor(x, y, t, ans) { this.bx=x; this.by=y; this.x=x; this.y=y; this.t=t; this.ans=ans; this.state="IDLE"; }
  flyTo(i) { this.target = dropZones[i]; this.chosen = i; this.state="FLYING"; }
  update() {
    if (this.state === "FLYING") {
      this.x = lerp(this.x, this.target.x + 125, 0.2); this.y = lerp(this.y, this.target.y + 47, 0.2);
      if (dist(this.x, this.y, this.target.x + 125, this.target.y + 47) < 5) {
        if (this.chosen === this.ans) { score += 10; feedbackText = "正確！"; this.state = "PAUSE"; setTimeout(() => { currentQ++; spawnMagnet(); }, 1500); }
        else { feedbackText = "錯誤！"; this.state = "EXPL"; setTimeout(() => { this.state = "RET"; }, 5000); }
      }
    } else if (this.state === "RET") { this.x = lerp(this.x, this.bx, 0.15); this.y = lerp(this.y, this.by, 0.15); if(dist(this.x,this.y,this.bx,this.by)<5) this.state="IDLE"; }
  }
  display() {
    push(); rectMode(CENTER); fill(50,55,70); stroke(255); rect(this.x, this.y, 220, 90, 10);
    fill(255); textAlign(CENTER, CENTER); text(this.t, this.x, this.y); pop();
    if (this.state === "EXPL") {
      fill(0,0,0,200); rect(0,0,800,500); fill(255); textAlign(CENTER, CENTER); textSize(24);
      text("答錯了！解析：", 400, 150);
      textSize(20); textAlign(LEFT, TOP);
      // 這裡強制限制解析文字寬度為 600px，高度為 200px，確保不跑版
      text(questions[currentQ].exp, 100, 200, 600, 200);
    }
  }
}