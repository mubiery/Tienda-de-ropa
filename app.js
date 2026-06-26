const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const products = [
  { id: 1, name: "Playera básica", old: 12.99, price: 7.99, promo: "2x descuento", emoji: "👕" },
  { id: 2, name: "Top casual", old: 11.99, price: 8.49, promo: "Oferta flash", emoji: "🎽" },
  { id: 3, name: "Blusa ligera", old: 13.99, price: 9.25, promo: "30% off", emoji: "👚" },
  { id: 4, name: "Short deportivo", old: 12.50, price: 8.99, promo: "Nuevo precio", emoji: "🩳" },
  { id: 5, name: "Falda casual", old: 14.00, price: 9.50, promo: "Últimas piezas", emoji: "👗" },
  { id: 6, name: "Leggings", old: 11.00, price: 7.50, promo: "Promo semanal", emoji: "🧘" },
  { id: 7, name: "Gorra urbana", old: 10.99, price: 6.99, promo: "40% off", emoji: "🧢" },
  { id: 8, name: "Calcetas pack", old: 9.99, price: 5.99, promo: "Pack ahorro", emoji: "🧦" },
  { id: 9, name: "Cinturón sencillo", old: 11.50, price: 8.25, promo: "Especial", emoji: "🧥" },
  { id: 10, name: "Bufanda fina", old: 10.99, price: 6.75, promo: "Temporada", emoji: "🧣" },
  { id: 11, name: "Bolsa tote", old: 12.99, price: 9.99, promo: "Más vendido", emoji: "👜" },
  { id: 12, name: "Sandalias básicas", old: 14.99, price: 9.75, promo: "Remate", emoji: "🩴" },
  { id: 13, name: "Pijama short", old: 13.50, price: 9.49, promo: "Cómodo", emoji: "🛌" },
  { id: 14, name: "Camisa sin mangas", old: 12.99, price: 8.75, promo: "Oferta día", emoji: "👔" },
  { id: 15, name: "Sudadera ligera", old: 15.99, price: 9.99, promo: "Precio final", emoji: "🧥" }
];

const $ = (id) => document.getElementById(id);
let currentUser = null;
let cart = [];

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function showMessage(text) {
  $("authMessage").textContent = text;
}
function showAdminMessage(text) {
  const el = $("adminMessage");
  if (el) el.textContent = text;
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}
function userExists(username) {
  const user = username.trim().toLowerCase();
  return user === ADMIN_USER || getUsers().some(u => u.user.toLowerCase() === user);
}
function switchAuth(mode) {
  const login = mode === "login";
  $("loginForm").classList.toggle("hidden", !login);
  $("registerForm").classList.toggle("hidden", login);
  $("loginTab").classList.toggle("active", login);
  $("registerTab").classList.toggle("active", !login);
  showMessage("");
}

$("loginTab").addEventListener("click", () => switchAuth("login"));
$("registerTab").addEventListener("click", () => switchAuth("register"));

$("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const users = getUsers();
  const user = $("regUser").value.trim();
  if (userExists(user)) {
    showMessage("Ese usuario ya existe. Elige otro.");
    return;
  }
  users.push({
    name: $("regName").value.trim(),
    user,
    email: $("regEmail").value.trim(),
    pass: $("regPass").value,
    createdAt: new Date().toLocaleString(),
    passwordChangedAt: "Creada al registrarse"
  });
  saveUsers(users);
  e.target.reset();
  switchAuth("login");
  showMessage("Registro creado. Ahora puedes iniciar sesión.");
});

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = $("loginUser").value.trim();
  const pass = $("loginPass").value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    login({ name: "Administrador", user: ADMIN_USER, admin: true });
    return;
  }
  const found = getUsers().find(u => u.user === user && u.pass === pass);
  if (!found) return showMessage("Usuario o contraseña incorrectos.");
  login({ ...found, admin: false });
});

function login(user) {
  currentUser = user;
  cart = JSON.parse(localStorage.getItem(`cart_${user.user}`) || "[]");
  $("authScreen").classList.add("hidden");
  $("storeScreen").classList.remove("hidden");
  $("welcomeText").textContent = `Hola, ${user.name}`;
  $("adminBtn").classList.toggle("hidden", !user.admin);
  renderProducts();
  renderCart();
  showView("shop");
}

function showView(view) {
  $("shopView").classList.toggle("hidden", view !== "shop");
  $("cartView").classList.toggle("hidden", view !== "cart");
  $("adminView").classList.toggle("hidden", view !== "admin");
  if (view === "admin") renderUsers();
}

$("shopBtn").addEventListener("click", () => showView("shop"));
$("cartBtn").addEventListener("click", () => showView("cart"));
$("adminBtn").addEventListener("click", () => showView("admin"));
$("logoutBtn").addEventListener("click", () => location.reload());
$("clearCartBtn").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
$("sortNameBtn").addEventListener("click", () => renderUsers("name"));
$("sortDateBtn").addEventListener("click", () => renderUsers("date"));

$("adminCreateUserForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentUser?.admin) return;
  const user = $("adminNewUser").value.trim();
  if (userExists(user)) {
    showAdminMessage("Ese usuario ya existe. Elige otro.");
    return;
  }
  const users = getUsers();
  users.push({
    name: $("adminNewName").value.trim(),
    user,
    email: $("adminNewEmail").value.trim(),
    pass: $("adminNewPass").value,
    createdAt: new Date().toLocaleString(),
    passwordChangedAt: "Creada por admin"
  });
  saveUsers(users);
  e.target.reset();
  showAdminMessage("Usuario creado correctamente.");
  renderUsers();
});

function renderProducts() {
  $("productsGrid").innerHTML = products.map(p => `
    <article class="product">
      <div class="emoji">${p.emoji}</div>
      <span class="badge">${p.promo}</span>
      <h3>${p.name}</h3>
      <div><span class="old-price">$${p.old.toFixed(2)}</span> <span class="price">$${p.price.toFixed(2)}</span></div>
      <button onclick="addToCart(${p.id})">Agregar al carrito</button>
    </article>
  `).join("");
}

window.addToCart = function(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
};

window.changeQty = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
};

function saveCart() {
  if (currentUser) localStorage.setItem(`cart_${currentUser.user}`, JSON.stringify(cart));
}
function renderCart() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  $("cartCount").textContent = count;
  if (!cart.length) {
    $("cartItems").innerHTML = "<p>No hay artículos en el carrito.</p>";
    $("cartTotal").textContent = "0.00";
    return;
  }
  let total = 0;
  $("cartItems").innerHTML = cart.map(i => {
    const p = products.find(product => product.id === i.id);
    const line = p.price * i.qty;
    total += line;
    return `
      <div class="cart-row">
        <div><strong>${p.name}</strong><br>$${p.price.toFixed(2)} x ${i.qty} = $${line.toFixed(2)}</div>
        <div class="qty-controls">
          <button onclick="changeQty(${p.id}, -1)">-</button>
          <button onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");
  $("cartTotal").textContent = total.toFixed(2);
}

function renderUsers(sortBy = "date") {
  if (!currentUser?.admin) return;
  let users = getUsers();
  if (sortBy === "name") users.sort((a, b) => a.name.localeCompare(b.name));
  else users = users.reverse();
  $("usersTable").innerHTML = users.map(u => `
    <tr>
      <td>${safeText(u.name)}</td>
      <td>${safeText(u.user)}</td>
      <td>${safeText(u.email)}</td>
      <td>${safeText(u.createdAt)}</td>
      <td>${safeText(u.passwordChangedAt || "Sin cambios")}</td>
      <td>
        <div class="password-cell">
          <input id="pass_${safeText(u.user)}" class="password-view" type="password" value="${safeText(u.pass)}" readonly />
          <button class="mini-button" onclick="togglePassword('${safeText(u.user)}')">👁 Ver</button>
          <button class="mini-button" onclick="copyPassword('${safeText(u.user)}')">Copiar</button>
        </div>
      </td>
      <td><button class="mini-button" onclick="resetUserPassword('${safeText(u.user)}')">Cambiar contraseña</button></td>
    </tr>
  `).join("") || `<tr><td colspan="7">Todavía no hay usuarios registrados.</td></tr>`;
}

window.togglePassword = function(username) {
  if (!currentUser?.admin) return;
  const input = document.getElementById(`pass_${username}`);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
};

window.copyPassword = async function(username) {
  if (!currentUser?.admin) return;
  const users = getUsers();
  const found = users.find(u => u.user === username);
  if (!found) return showAdminMessage("Usuario no encontrado.");
  try {
    await navigator.clipboard.writeText(found.pass);
    showAdminMessage(`Contraseña de ${username} copiada.`);
  } catch {
    const input = document.getElementById(`pass_${username}`);
    if (input) {
      input.type = "text";
      input.select();
      document.execCommand("copy");
      showAdminMessage(`Contraseña de ${username} copiada.`);
    }
  }
};

window.resetUserPassword = function(username) {
  if (!currentUser?.admin) return;
  const newPass = prompt(`Nueva contraseña para ${username}:`);
  if (newPass === null) return;
  if (newPass.length < 4) {
    showAdminMessage("La contraseña debe tener mínimo 4 caracteres.");
    return;
  }
  const users = getUsers();
  const index = users.findIndex(u => u.user === username);
  if (index === -1) {
    showAdminMessage("Usuario no encontrado.");
    return;
  }
  users[index].pass = newPass;
  users[index].passwordChangedAt = new Date().toLocaleString();
  saveUsers(users);
  showAdminMessage(`Contraseña actualizada para ${username}.`);
  renderUsers();
};
