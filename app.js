import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyAUhKOnQPCPsTvykWut7_X5lrcz8VQmbdc",
  authDomain: "subscription-47d81.firebaseapp.com",
  projectId: "subscription-47d81",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTMLの要素
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userEmail = document.getElementById("userEmail");
const serviceName = document.getElementById("serviceName");
const price = document.getElementById("price");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");

let currentUser = null;

// ログイン処理
loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
});

// ログアウト
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// ユーザー状態を監視
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    userInfo.style.display = "block";
    userEmail.textContent = `ログイン中: ${user.email}`;

    await loadSubscriptions();
  } else {
    currentUser = null;
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    userInfo.style.display = "none";
  }
});

// サブスク追加処理
addBtn.addEventListener("click", async () => {
  const name = serviceName.value;
  const monthly = parseInt(price.value);

  if (!name || isNaN(monthly)) return;

  await addDoc(collection(db, "subscriptions"), {
    uid: currentUser.uid,
    name,
    monthly,
    createdAt: new Date()
  });

  serviceName.value = "";
  price.value = "";
  await loadSubscriptions();
});

// ユーザーのサブスクを取得・表示
async function loadSubscriptions() {
  list.innerHTML = "";

  const q = query(
    collection(db, "subscriptions"),
    where("uid", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.name}: ￥${data.monthly}`;
    list.appendChild(li);
  });
}
