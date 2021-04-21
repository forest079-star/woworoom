console.log(api_path, token);
let url = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`;

let productData = [];
let cartData = [];
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const orderInfoForm = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll("input[name], select");

// productList.innerHTML = str;

function init() {
  getProductList();
  getCartList();
}
init();

function getProductList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      console.log(response.data.products);
      productData = response.data.products;
      renderProductList();
    })
}

function combineProductHTMLItem(item) {
  return `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}"
                alt="">
            <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`
}

function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item)
  })
  productList.innerHTML = str
}
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductHTMLItem(item)
    }
  })
  productList.innerHTML = str
})

productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass != "js-addCart") return;
  let productId = e.target.getAttribute("data-id");
  console.log(productId);
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function (response) {
    console.log(response);
    alert("加入購物車");
    getCartList();
  })

})

function getCartList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      document.querySelector(".js-finalTotal").textContent = toThousands(response.data.finalTotal);
      console.log(response.data);
      cartData = response.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `
             <tr>
                <td>
                  <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                  </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>${item.quantity}</td>
                <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                <td class="discardBtn">
                  <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                  </a>
                </td>
            </tr>
        `
      });
      cartList.innerHTML = str;
    })
}

cartList.addEventListener("click", function (e) {
  e.preventDefault();
  let cartId = e.target.getAttribute("data-id");
  console.log(cartId);
  if (cartId == null) {
    return
  }
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      alert("刪除該筆購物車成功");
      getCartList();
    })
})

//刪除全部購物車流程
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      alert("刪除全部購物車成功！")
      getCartList();
    })
    .catch(function (response) {
      alert("購物車已經清空，請勿重複點擊！")
    })
})

// 送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  cartData
  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;

  if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == "") {
    alert("請輸入訂單資訊")
    return;
  }

  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function (response) {
    alert("訂單建立成功");
    // document.querySelector("#customerName").value = "";
    // document.querySelector("#customerPhone").value = "";
    // document.querySelector("#customerEmail").value = "";
    // document.querySelector("#customerAddress").value = "";
    // orderInfoForm.reset();
    document.querySelector("#tradeWay").value = "ATM";
    getCartList()
  })

})


// utils js
// 讓數字千位數增加小數點
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// 電話驗證 傳字串
function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone)) {
    return true
  }
  return false;
}

const constraints = {
  姓名: {
    presence: {
      message: "必填欄位"
    }
  },
  電話: {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  信箱: {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  寄送地址: {
    presence: {
      message: "必填欄位"
    }
  },
  交易方式: {
    presence: {
      message: "必填欄位"
    }
  }
};
console.log(inputs)

inputs.forEach((item) => {
  item.addEventListener("change", function () {
    item.nextElementSibling.textContent = "";
    let errors = validate(orderInfoForm, constraints) || "";
    console.log(errors);

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`))
        document.querySelector(`[data-message="${keys}"]`).textContent =
          errors[keys];
      });
    }
  });
});