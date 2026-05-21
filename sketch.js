let video, handPose, hands = [];
let gameState = "START", score = 0, currentQ = 0, feedbackText = "", feedbackColor;
let currentMagnet = null;
let dropZones = [];

// 手勢鎖定計時器
let gestureTimer = 0;
let lastGesture = 0;
const CONFIRM_TIME = 15; // 維持手勢約 15 幀 (0.5秒) 來鎖定選項

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

  let zoneLabels = ["嬰兒期", "幼兒期", "學齡前期", "青春期"];
  for (let i = 0; i < 4; i++) {
    // 增加選項編號 [1], [2], [3], [4] 讓玩家對應數字
    dropZones.push({ x: 30, y: 40 + i * 110, w: 180, h: 90, label: zoneLabels[i], num: i + 1 });
  }
}

function draw() {
  background(30);

  // 1. 鏡像繪製視訊
  push();
  translate(width, 0); scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (gameState === "START") drawStart();
  else if (gameState === "PLAY") drawPlay();
  else if (gameState === "END") drawEnd();
}

function drawPlay() {
  fill(0, 0, 0, 150); rect(0, 0, width, height);

  // 繪製分類區 (左側)
  for (let z of dropZones) {
    fill(255, 223, 0, 40); stroke(255, 223, 0); strokeWeight(2);
    rect(z.x, z.y, z.w, z.h, 10);
    fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(20);
    text(`[ ${z.num} ] ${z.label}`, z.x + z.w/2, z.y + z.h/2);
  }

  // 手部偵測與邏輯
  if (hands.length > 0) {
    let hand = hands[0];
    let fingers = countFingers(hand); // 取得伸出的手指數量
    
    // 繪製手部關鍵點
    for (let pt of hand.keypoints) {
      fill(0, 223, 162); noStroke();
      ellipse(pt.x, pt.y, 8, 8);
    }

    // 當方塊在原地等待時，進行手勢判斷
    if (currentMagnet && currentMagnet.state === "IDLE") {
      if (fingers >= 1 && fingers <= 4) {
        if (fingers === lastGesture) {
          gestureTimer++;
          // 在手腕處畫出鎖定進度條
          drawProgressBar(hand.keypoints[0].x, hand.keypoints[0].y, gestureTimer / CONFIRM_TIME, fingers);
          
          if (gestureTimer >= CONFIRM_TIME) {
            // 觸發！讓方塊飛向對應的格子 (fingers - 1 是因為陣列從 0 開始)
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
    gestureTimer = 0; // 手不在畫面上就歸零
  }

  // 繪製與更新方塊畫面
  if (currentMagnet) {
    currentMagnet.update();
    currentMagnet.display();
  }

  // 底部提示文字
  fill(feedbackColor || 255); textSize(24); text(feedbackText, width/2, 460);
}

// 🖐️ 計算伸出的手指數量（利用指尖與手腕的距離）
function countFingers(hand) {
  let count = 0;
  let tips = [4, 8, 12, 16, 20];   // 拇、食、中、無名、小指尖端
  let joints = [2, 6, 10, 14, 18]; // 對應的根部關節
  let wrist = hand.keypoints[0];

  for (let i = 0; i < 5; i++) {
    let dTip = dist(hand.keypoints[tips[i]].x, hand.keypoints[tips[i]].y, wrist.x, wrist.y);
    let dJoint = dist(hand.keypoints[joints[i]].x, hand.keypoints[joints[i]].y, wrist.x, wrist.y);
    
    // 如果指尖到手腕的距離，大於指根到手腕的距離的 1.2 倍，代表手指是伸直的
    if (dTip > dJoint * 1.2) { 
      count++;
    }
  }
  return count;
}

// 繪製手勢確認進度條
function drawProgressBar(x, y, progress, number) {
  push();
  // 外圈底色
  noFill(); stroke(0, 0, 0, 100); strokeWeight(8);
  ellipse(x, y, 90, 90);
  // 進度條
  stroke(0, 255, 150); strokeWeight(8); strokeCap(ROUND);
  arc(x, y, 90, 90, -HALF_PI, -HALF_PI + TWO_PI * progress);
  // 顯示即將選擇的數字
  fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(24); textStyle(BOLD);
  text(number, x, y);
  pop();
}

function drawStart() {
  textAlign(CENTER, CENTER); fill(255); textSize(30);
  text("指尖實驗室\n(舉起手掌開始，比數字 1~4 作答)", width/2, height/2);
  if (hands.length > 0) { gameState = "PLAY"; spawnMagnet(); }
}

function drawEnd() {
  textAlign(CENTER, CENTER); fill(255); textSize(40);
  text("實驗完成！總分：" + score, width/2, height/2);
}

function spawnMagnet() {
  if (currentQ >= 4) { gameState = "END"; return; }
  currentMagnet = new MagnetBox(600, 250, ["嬰兒期", "幼兒期", "學齡前期", "青春期"][currentQ], ["嬰兒期", "幼兒期", "學齡前期", "青春期"][currentQ]);
  feedbackText = "請對著鏡頭比出 1、2、3 或 4 來歸類";
}

// 📦 方塊類別
class MagnetBox {
  constructor(x, y, text, ans) {
    this.bx = x; this.by = y; this.x = x; this.y = y; this.text = text; this.ans = ans;
    this.state = "IDLE"; // IDLE (等待中), FLYING (飛向目標), RETURNING (錯誤彈回)
    this.targetZone = null;
  }
  
  flyTo(zoneIndex) {
    this.targetZone = dropZones[zoneIndex];
    this.state = "FLYING";
    feedbackText = "傳送中...";
  }
  
  update() { 
    if (this.state === "FLYING") {
      // 飛向目標格子的中心點
      let tx = this.targetZone.x + this.targetZone.w / 2;
      let ty = this.targetZone.y + this.targetZone.h / 2;
      this.x = lerp(this.x, tx, 0.15);
      this.y = lerp(this.y, ty, 0.15);
      
      // 當距離小於 5，代表抵達，進行判定
      if (dist(this.x, this.y, tx, ty) < 5) {
        if (this.ans === this.targetZone.label) {
          score += 10;
          feedbackText = "正確！🎉";
          currentQ++;
          spawnMagnet(); 
        } else {
          feedbackText = "放錯了！❌ 準備彈回...";
          this.state = "RETURNING";
        }
      }
    } else if (this.state === "RETURNING") {
      // 錯誤彈回原位
      this.x = lerp(this.x, this.bx, 0.15);
      this.y = lerp(this.y, this.by, 0.15);
      
      if (dist(this.x, this.y, this.bx, this.by) < 5) {
        this.x = this.bx;
        this.y = this.by;
        this.state = "IDLE";
        feedbackText = "請對著鏡頭比出 1、2、3 或 4 來歸類";
      }
    }
  }
  
  display() {
    push();
    rectMode(CENTER);
    
    // 依據狀態改變顏色
    if (this.state === "FLYING") {
      fill(40, 60, 90, 220); stroke(0, 255, 150); strokeWeight(4);
    } else if (this.state === "RETURNING") {
      fill(90, 40, 40, 220); stroke(255, 50, 50); strokeWeight(4);
    } else {
      fill(60, 64, 81); stroke(200); strokeWeight(2);
    }
    
    rect(this.x, this.y, 200, 100, 10);
    fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(20); textStyle(BOLD);
    text(this.text, this.x, this.y, 180, 90);
    pop();
  }
}