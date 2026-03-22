const state = {
  token: "",
  user: null
};

const el = (id) => document.getElementById(id);

const pretty = (value) => JSON.stringify(value, null, 2);

const apiRequest = async (path, { method = "GET", body } = {}) => {
  const baseUrl = el("apiBaseUrl").value.trim();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(pretty(data));
  }

  return data;
};

el("loginButton").addEventListener("click", async () => {
  try {
    const payload = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: el("email").value.trim(),
        password: el("password").value
      }
    });

    state.token = payload.token;
    state.user = payload.user;

    el("authOutput").textContent = pretty({
      login: "success",
      user: payload.user,
      tokenPreview: `${payload.token.slice(0, 16)}...`
    });
  } catch (error) {
    el("authOutput").textContent = `Login failed:\n${error.message}`;
  }
});

el("loadProductsButton").addEventListener("click", async () => {
  try {
    const payload = await apiRequest("/products");
    el("productsOutput").textContent = pretty(payload);
  } catch (error) {
    el("productsOutput").textContent = `Could not load products:\n${error.message}`;
  }
});

el("createRoomButton").addEventListener("click", async () => {
  try {
    const payload = await apiRequest("/chat/rooms", {
      method: "POST",
      body: {
        supplierId: el("supplierIdInput").value.trim(),
        vendorId: el("vendorIdInput").value.trim()
      }
    });

    el("roomIdInput").value = payload.room.id;
    el("chatOutput").textContent = pretty(payload);
  } catch (error) {
    el("chatOutput").textContent = `Could not create room:\n${error.message}`;
  }
});

el("sendMessageButton").addEventListener("click", async () => {
  try {
    const roomId = el("roomIdInput").value.trim();
    const payload = await apiRequest(`/chat/rooms/${roomId}/messages`, {
      method: "POST",
      body: {
        text: el("chatMessageInput").value
      }
    });

    el("chatOutput").textContent = pretty(payload);
  } catch (error) {
    el("chatOutput").textContent = `Message failed:\n${error.message}`;
  }
});

el("loadMessagesButton").addEventListener("click", async () => {
  try {
    const roomId = el("roomIdInput").value.trim();
    const payload = await apiRequest(`/chat/rooms/${roomId}/messages`);
    el("chatOutput").textContent = pretty(payload);
  } catch (error) {
    el("chatOutput").textContent = `Could not load messages:\n${error.message}`;
  }
});

el("createStreamButton").addEventListener("click", async () => {
  try {
    const payload = await apiRequest("/live/streams", {
      method: "POST",
      body: {
        title: el("streamTitleInput").value.trim(),
        description: el("streamDescriptionInput").value.trim(),
        scheduledAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      }
    });

    el("streamIdInput").value = payload.stream.id;
    el("liveOutput").textContent = pretty(payload);
  } catch (error) {
    el("liveOutput").textContent = `Could not create stream:\n${error.message}`;
  }
});

el("startStreamButton").addEventListener("click", async () => {
  try {
    const streamId = el("streamIdInput").value.trim();
    const payload = await apiRequest(`/live/streams/${streamId}/start`, {
      method: "POST"
    });

    el("liveOutput").textContent = pretty(payload);
  } catch (error) {
    el("liveOutput").textContent = `Could not start stream:\n${error.message}`;
  }
});

el("createAuctionButton").addEventListener("click", async () => {
  try {
    const streamId = el("streamIdInput").value.trim();
    const payload = await apiRequest(`/live/streams/${streamId}/auctions`, {
      method: "POST",
      body: {
        productId: el("auctionProductIdInput").value.trim(),
        startPrice: Number(el("startPriceInput").value),
        reservePrice: Number(el("reservePriceInput").value)
      }
    });

    el("liveOutput").textContent = pretty(payload);
  } catch (error) {
    el("liveOutput").textContent = `Could not create auction:\n${error.message}`;
  }
});
