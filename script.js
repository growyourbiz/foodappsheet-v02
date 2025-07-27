const apiURL = "https://script.google.com/macros/s/AKfycbzLC81e8o_cO1-b8i-XQUtllK5V1BhVkY6OresK-pMz9On2Up1Fs1Rwltk01GyRFCc/exec"; // ✅ API ของคุณ

async function fetchMenu() {
  try {
    const res = await fetch(apiURL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    let data = await res.json();

    // ✅ ตรวจสอบว่า response เป็น array และมีข้อมูล
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("ข้อมูลไม่ถูกต้อง");
    }

    // ✅ กรอง row ที่ไม่มีข้อมูลจำเป็น
    data = data.filter(
      (item) =>
        item["ชื่อรายการอาหาร"]?.trim() &&
        item["ราคา"]?.trim() &&
        item["รูปภาพ (URL)"]?.trim()
    );

    // ✅ เมนูแนะนำ 3 รายการแรก
    const featured = data.slice(0, 3);
    const featuredGrid = document.getElementById("featured-grid");
    featured.forEach((item) => {
      const div = createMenuItem(item);
      featuredGrid.appendChild(div);
    });

    // ✅ รอเลื่อนจึงโหลดส่วนที่เหลือ
    const rest = data.slice(3);
    window.addEventListener("scroll", function onScroll() {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 100) {
        loadAllMenus(rest);
        window.removeEventListener("scroll", onScroll);
      }
    });

  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    document.getElementById("error-message").textContent =
      "ไม่สามารถโหลดข้อมูลเมนูอาหารได้ กรุณาลองใหม่อีกครั้ง";
  }
}

function createMenuItem(item) {
  const priceText = item["ราคา"].toString().replace(/[฿]/g, "").trim();
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = `
    <img 
      src="${item["รูปภาพ (URL)"]}" 
      alt="${item["ชื่อรายการอาหาร"]}" 
      loading="lazy"
    />
    <div class="item-title">${item["ชื่อรายการอาหาร"]}</div>
    <div class="item-price">${priceText} บาท</div>
  `;
  return div;
}

function loadAllMenus(data) {
  const grouped = {};
  data.forEach((item) => {
    const category = item["หมวดหมู่"] || "ไม่มีหมวดหมู่";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  });

  const container = document.getElementById("menus-container");

  for (const category in grouped) {
    const h2 = document.createElement("h2");
    h2.textContent = category;
    container.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "grid";

    grouped[category].forEach((item) => {
      const div = createMenuItem(item);
      grid.appendChild(div);
    });

    container.appendChild(grid);
  }
}

fetchMenu();
