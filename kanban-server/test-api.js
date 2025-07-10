const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function testAPI() {
  try {
    console.log("🧪 Starting API tests...\n");

    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log("✅ Health check:", healthResponse.data);

    // Test 2: User registration
    console.log("\n2️⃣ Testing user registration...");
    const registerData = {
      name: "Test User",
      email: "test" + Date.now() + "@example.com",
      password: "password123",
    };
    const registerResponse = await axios.post(
      `${BASE_URL}/api/auth/register`,
      registerData
    );
    console.log("✅ User registered:", {
      id: registerResponse.data.user.id,
      name: registerResponse.data.user.name,
      email: registerResponse.data.user.email,
      tokenLength: registerResponse.data.token.length,
    });

    const token = registerResponse.data.token;

    // Test 3: User login
    console.log("\n3️⃣ Testing user login...");
    const loginData = {
      email: registerData.email,
      password: registerData.password,
    };
    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData
    );
    console.log("✅ User logged in:", {
      id: loginResponse.data.user.id,
      name: loginResponse.data.user.name,
      tokenLength: loginResponse.data.token.length,
    });

    // Test 4: Create board
    console.log("\n4️⃣ Testing board creation...");
    const boardData = { title: "My Test Board" };
    const boardResponse = await axios.post(
      `${BASE_URL}/api/boards`,
      boardData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Board created:", {
      id: boardResponse.data._id,
      title: boardResponse.data.title,
      userId: boardResponse.data.userId,
    });

    const boardId = boardResponse.data._id;

    // Test 5: Get boards
    console.log("\n5️⃣ Testing get boards...");
    const boardsResponse = await axios.get(`${BASE_URL}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Boards retrieved:", boardsResponse.data.length, "boards");

    // Test 6: Create list
    console.log("\n6️⃣ Testing list creation...");
    const listData = { title: "To Do", boardId };
    const listResponse = await axios.post(`${BASE_URL}/api/lists`, listData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ List created:", {
      id: listResponse.data._id,
      title: listResponse.data.title,
      boardId: listResponse.data.boardId,
    });

    const listId = listResponse.data._id;

    // Test 7: Get lists for board
    console.log("\n7️⃣ Testing get lists for board...");
    const listsResponse = await axios.get(
      `${BASE_URL}/api/lists/board/${boardId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Lists retrieved:", listsResponse.data.length, "lists");

    // Test 8: Create card
    console.log("\n8️⃣ Testing card creation...");
    const cardData = {
      title: "My First Task",
      description: "This is a test task",
      listId,
    };
    const cardResponse = await axios.post(`${BASE_URL}/api/cards`, cardData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Card created:", {
      id: cardResponse.data._id,
      title: cardResponse.data.title,
      listId: cardResponse.data.listId,
    });

    // Test 9: Get cards for list
    console.log("\n9️⃣ Testing get cards for list...");
    const cardsResponse = await axios.get(
      `${BASE_URL}/api/cards/list/${listId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("✅ Cards retrieved:", cardsResponse.data.length, "cards");

    console.log("\n🎉 All API tests passed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testAPI();
