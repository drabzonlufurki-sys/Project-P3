const LS_KEY = "leden_app_members_v1";
const LS_ACTIVE = "leden_app_active_email_v1";
const LS_ADMIN = "leden_app_admin_logged_in_v1";

const loadMembers = () => JSON.parse(localStorage.getItem(LS_KEY)) ?? [];
const saveMembers = (m) => { localStorage.setItem(LS_KEY, JSON.stringify(m)); refreshAll(); };

async function generateQRData(member) {
    return new Promise((resolve) => {
        const div = document.createElement("div");
        const dataStr = JSON.stringify({ id: member.id, n: member.name, e: member.email });
        new QRCode(div, { text: dataStr, width: 256, height: 256 });
        setTimeout(() => {
            const img = div.querySelector("img");
            resolve(img ? img.src : "");
        }, 100);
    });
}

document.querySelectorAll(".tabbtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tabbtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
        document.getElementById(`tab-${btn.dataset.tab}`).style.display = "";
        refreshAll();
    });
});

document.getElementById("btn_register").addEventListener("click", () => {
    const name = document.getElementById("reg_name").value.trim();
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const phone = document.getElementById("reg_phone").value.trim();
    if (!name || !email || !phone) return alert("Vul alles in.");
    
    const members = loadMembers();
    if (members.some(m => m.email === email)) return alert("E-mail bestaat al.");

    members.push({ id: Math.random().toString(16).slice(2), name, email, phone, createdAt: new Date().toISOString() });
    saveMembers(members);
    alert("Geregistreerd!");
});

document.getElementById("btn_clear_all").addEventListener("click", () => {
    if (confirm("Alles wissen?")) { localStorage.clear(); refreshAll(); }
});

document.getElementById("btn_login").addEventListener("click", () => {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const members = loadMembers();
    if (members.some(m => m.email === email)) {
        localStorage.setItem(LS_ACTIVE, email);
        refreshAll();
    } else { alert("Niet gevonden."); }
});

document.getElementById("btn_logout").addEventListener("click", () => {
    localStorage.removeItem(LS_ACTIVE);
    refreshAll();
});

document.getElementById("btn_admin_login").addEventListener("click", () => {
    if (document.getElementById("admin_user").value === "admin" && document.getElementById("admin_pass").value === "admin123") {
        localStorage.setItem(LS_ADMIN, "1");
        refreshAll();
    } else { alert("Fout!"); }
});

document.getElementById("btn_admin_logout").addEventListener("click", () => {
    localStorage.removeItem(LS_ADMIN);
    refreshAll();
});

function refreshAll() {
    const members = loadMembers();
    const isAdmin = localStorage.getItem(LS_ADMIN) === "1";
    const activeEmail = localStorage.getItem(LS_ACTIVE);

    document.getElementById("count_members").textContent = members.length;
    document.getElementById("admin_state").textContent = isAdmin ? "ingelogd" : "uitgelogd";
    
    document.getElementById("admin_panel").style.display = isAdmin ? "block" : "none";
    document.getElementById("admin_login_box").style.display = isAdmin ? "none" : "block";

    const profileBox = document.getElementById("profile_box");
    const loginSection = document.getElementById("login_section");
    const member = members.find(x => x.email === activeEmail);

    if (member) {
        loginSection.style.display = "none";
        profileBox.style.display = "block";
        document.getElementById("prof_name").value = member.name;
        document.getElementById("prof_email").value = member.email;
        document.getElementById("prof_phone").value = member.phone;
    } else {
        loginSection.style.display = "block";
        profileBox.style.display = "none";
    }

    if (isAdmin) renderAdminTable();
}

function renderAdminTable() {
    const body = document.getElementById("admin_table_body");
    const query = document.getElementById("admin_search").value.toLowerCase();
    const members = loadMembers().filter(m => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query));
    
    body.innerHTML = "";
    members.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${m.name}</td><td>${m.email}</td><td>${m.phone}</td>
            <td><button onclick="showQR('${m.id}')">QR</button> <button class="danger" onclick="deleteMember('${m.id}')">X</button></td>`;
        body.appendChild(tr);
    });
}

async function showQR(id) {
    const m = loadMembers().find(x => x.id === id);
    document.getElementById("qr_member_name").textContent = m.name;
    document.getElementById("qr_img").src = await generateQRData(m);
    document.getElementById("qr_modal").style.display = "flex";
}

window.deleteMember = (id) => { if (confirm("Wissen?")) saveMembers(loadMembers().filter(m => m.id !== id)); };
window.showQR = showQR;
document.getElementById("qr_close").addEventListener("click", () => document.getElementById("qr_modal").style.display = "none");
document.getElementById("admin_search").addEventListener("input", renderAdminTable);

document.getElementById("btn_export").addEventListener("click", async () => {
    const enriched = await Promise.all(loadMembers().map(async m => ({ ...m, qrCode: await generateQRData(m) })));
    const blob = new Blob([JSON.stringify(enriched, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leden_qr.json"; a.click();
});

refreshAll();