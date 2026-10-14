console.log("Welcome");

// sample data

let items = [];

async function loadItems() {
    const token = localStorage.getItem("token");

    if (!token) {
        toast("Please login to view items", "warning");
        openAuth();
        items = [];
        renderItems();
        updateStats();
        return;
    }

    const response = await fetch("http://localhost:5000/api/items", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!response.ok) {
        toast("Session expired, please login again", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        updateNavbar();
        items = [];
        renderItems();
        updateStats();
        return;
    }

    items = await response.json();
    renderItems();
    updateStats();
    updateNavbar();
}
//global variables
let currentType = "all";
let selectedPostType = "lost";
let selectedImage = "";

//render card
function renderItems(){

    const grid = document.getElementById("itemsGrid");
    grid.innerHTML = "";

    // Read filters
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("catFilter").value;
    const location = document.getElementById("locFilter").value;

    // Filter items
    const filtered = items.filter(item => {

        const matchesSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword);

        const matchesCategory =
            category === "" || item.category === category;

        const matchesLocation =
            location === "" || item.location === location;

        const matchesType =
            currentType === "all" || item.type === currentType;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesLocation &&
            matchesType
        );

    });

    // Empty state
    if(filtered.length === 0){

        grid.innerHTML = `
            <div class="empty">
                <div class="empty-ico">📭</div>
                <h3>No items found</h3>
                <p>Try another search or filter.</p>
            </div>
        `;

        return;
    }

    // Render cards
    filtered.forEach(item => {

        grid.innerHTML += `

        <div class="card ${item.claimed ? "claimed-card" : ""}"
             onclick="showDetails(${item.id})">

            ${
                item.image
                ? `<img src="${item.image}" class="card-thumb">`
                : `<div class="card-placeholder">📦</div>`
            }

            <div class="card-body">

                <div class="card-top">

                    <div class="card-name">
                        ${item.name}
                    </div>

                    ${
                        item.claimed
                        ? `<span class="tag claimed-tag">Claimed</span>`
                        : `<span class="tag tag-${item.type}">
                                ${item.type.toUpperCase()}
                           </span>`
                    }

                </div>

                <div class="card-desc">
                    ${item.description}
                </div>

                <div class="card-location">
                    📍 ${item.location}
                </div>

                <div class="card-actions">

                    <button
                        class="claim-btn"
                        onclick="toggleClaim(${item.id},event)">

                        ${item.claimed ? "↩ Reopen" : "✔ Claimed"}

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteItem(${item.id},event)">

                        🗑 Delete

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}
function showDetails(id){

    const item = items.find(item => item.id === id);

    if(!item) return;

    const detailBox = document.getElementById("detailBox");

    detailBox.innerHTML = `
    
    <div class="detail-header">

        <h2>Item Details</h2>

        <button class="close" onclick="closeDetail()">
            ✕
        </button>

    </div>

    ${
        item.image
        ? `<img src="${item.image}" class="detail-img">`
        : `<div class="detail-placeholder">📦</div>`
    }

    <div class="detail-body">

        <h2 class="detail-name">${item.name}</h2>

        <p class="detail-desc">${item.description}</p>

        <div class="detail-meta-grid">

            <div class="detail-meta-cell">
                <div class="dmc-lbl">Category</div>
                <div class="dmc-val">${item.category}</div>
            </div>

            <div class="detail-meta-cell">
                <div class="dmc-lbl">Location</div>
                <div class="dmc-val">${item.location}</div>
            </div>

            <div class="detail-meta-cell">
                <div class="dmc-lbl">Date</div>
                <div class="dmc-val">${item.date}</div>
            </div>

            <div class="detail-meta-cell">
                <div class="dmc-lbl">Contact</div>
                <div class="dmc-val">${item.contact}</div>
            </div>

        </div>

        <button class="contact-action">
            Contact Owner
        </button>

    </div>
    `;

    document.getElementById("detailWrap").classList.add("open");

}
// close card

function closeDetail(){

    document
    .getElementById("detailWrap")
    .classList.remove("open");

}

function bgCloseDetail(event){

    if(event.target.id==="detailWrap"){

        closeDetail();

    }

}

// render stats 

function updateStats(){
    document.getElementById("stat-total").innerText = items.length;
    document.getElementById("stat-lost").innerText =
        items.filter(item => item.type=="lost").length;

    document.getElementById("stat-found").innerText =
        items.filter(item => item.type=="found").length;
}

loadItems();
function setType (type , button){
    currentType = type;

    document.querySelectorAll(".pill").forEach(pill =>{
        pill.classList.remove("active");
    });
    button.classList.add("active");
    renderItems();
}

function selectType(type){
    selectedPostType = type;

    const lostBtn = document.getElementById("btnLost");
    const foundBtn = document.getElementById("btnFound");

    lostBtn.classList.remove("sel-lost");
    foundBtn.classList.remove("sel-found");

    if(type==="lost"){
        lostBtn.classList.add("sel-lost");
    }else{
        foundBtn.classList.add("sel-found");
    }
}

function openPost(type="lost"){
    document.getElementById("postOverlay").classList.add("open");

    selectType(type);
}

function closePost(){
    document.getElementById("postOverlay").classList.remove("open")
}


//submit image

async function submitPost() {

    const name = document.getElementById("fName").value.trim();
    const category = document.getElementById("fCat").value;
    const description = document.getElementById("fDesc").value.trim();
    const location = document.getElementById("fLoc").value;
    const date = document.getElementById("fDate").value;
    const contact = document.getElementById("fContact").value.trim();

    if(name===""){
        toast("Please enter item name.");
        return;
    }

    const token = localStorage.getItem("token");

    if(!token){
        toast("Please login first","error");
        openAuth();
        return;
    }

    const formData = new FormData();

    formData.append("type", selectedPostType);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("item_date", date);
    formData.append("contact", contact);
    formData.append("claimed", 0);

    if(selectedImage){
        formData.append("image", selectedImage);
    }

    try{

        const response = await fetch(
            "http://localhost:5000/api/items",
            {

                method:"POST",

                headers:{
                    Authorization:"Bearer "+token
                },

                body:formData

            }
        );

        const data = await response.json();

        console.log(data);

        if(response.ok){

            toast("Item Added Successfully");

            closePost();

            document.getElementById("fName").value="";
            document.getElementById("fDesc").value="";
            document.getElementById("fDate").value="";
            document.getElementById("fContact").value="";
            document.getElementById("uploadName").innerText="";

            selectedImage = "";

            loadItems();

        }else{

            toast(data.message,"error");

        }

    }catch(err){

        console.log(err);

        toast("Upload Failed","error");

    }

}


//bg close
function bgClose(event,id){

    if(event.target.id === id){

        document.getElementById(id)
        .classList.remove("open");

    }

}


  function handleFile(input){

    const file = input.files[0];

    if(!file) return;

    selectedImage = file;

    document.getElementById("uploadName").innerText = file.name;

}

//tost noti
function toast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = "toast";

    if(type === "success"){
        toast.style.borderLeft = "4px solid #22c55e";
    }

    if(type === "error"){
        toast.style.borderLeft = "4px solid #ef4444";
    }

    if(type === "warning"){
        toast.style.borderLeft = "4px solid #f59e0b";
    }

    toast.innerText = message;

    document.getElementById("toasts").appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

//delete item

async function deleteItem(id, event) {

    event.stopPropagation();

    const ok = confirm("Delete this item?");

    if (!ok) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `http://localhost:5000/api/items/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            toast("Item deleted");

            loadItems();

        } else {

            toast(data.message, "error");

        }

    } catch (err) {

        console.log(err);

        toast("Delete failed", "error");

    }

}

async function toggleClaim(id, event) {

    event.stopPropagation();

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `http://localhost:5000/api/items/${id}/claim`,
            {
                method: "PATCH",

                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            toast("Claim status updated");

            loadItems();

        } else {

            toast(data.message, "error");

        }

    } catch (err) {

        console.log(err);

        toast("Update failed", "error");

    }

}

function openAuth() {
    document.getElementById("authWrap").classList.add("open");
}

function closeAuth() {
    document.getElementById("authWrap").classList.remove("open");
}
function openRegister() {

    closeAuth();

    setTimeout(() => {
        document
            .getElementById("registerWrap")
            .classList.add("open");
    }, 150);

}

function closeRegister(){

    document
        .getElementById("registerWrap")
        .classList.remove("open");

}

//register in db

async function registerUser(){

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const password = document.getElementById("regPassword").value;

    try{

        const response = await fetch(
            "http://localhost:5000/api/register",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })

            }
        );

        const data = await response.json();

        toast(data.message);

        closeRegister();

    }catch(err){

        console.log(err);

        toast("Registration Failed","error");

    }

}

//login form
async function loginUser(){

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try{

        const response = await fetch(
            "http://localhost:5000/api/login",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    email,
                    password
                })

            }
        );

        const data = await response.json();

        if(response.ok){

            localStorage.setItem("token", data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
updateNavbar();
            toast("Login Successful");

            closeAuth();
            loadItems();
        }else{

            toast(data.message,"error");

        }

    }catch(err){

        console.log(err);

        toast("Login Failed","error");

    }

}
//update navbar

function updateNavbar(){

    const user = JSON.parse(localStorage.getItem("user"));

    const btn = document.getElementById("loginBtn");

    if(user){

        btn.innerHTML = "👤 " + user.name ;

        btn.onclick = toggleDropdown;

    }

    else{

        btn.innerHTML = "Sign in";

        btn.onclick = openAuth;

    }

}

function toggleDropdown(){

    document
        .getElementById("dropdownMenu")
        .classList.toggle("show");

}
function logoutUser(){

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    updateNavbar();

    document
        .getElementById("dropdownMenu")
        .classList.remove("show");

    toast("Logged out");
    loadItems();

}
function openProfile(){

    const user = JSON.parse(localStorage.getItem("user"));

    toast(user.name);

}
window.onclick = function(event){

    if(!event.target.closest(".user-menu")){

        document
            .getElementById("dropdownMenu")
            .classList.remove("show");

    }

}

