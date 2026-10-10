local g = game
local P = g:GetService("Players")
local lp = P.LocalPlayer
local hs = g:GetService("HttpService")
local ts = g:GetService("TeleportService")
local cg = g:GetService("CoreGui")

-- =========================================================
-- 0. HỆ THỐNG XÁC THỰC KEY QUA API VERCEL (FOOYYA'AA)
-- =========================================================
local API_URL = "https://key123.vercel.app/api/verify"

-- Phim request executor-oota adda addaa deeggaru fayyadamuu
local http_request_func = (syn and syn.request) or (http and http.request) or request or (fluxus and fluxus.request)

local function verifyKeyWithServer(inputKey)
    local payload = hs:JSONEncode({ key = inputKey })
    
    if http_request_func then
        local response = http_request_func({
            Url = API_URL,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = payload
        })
        
        if response and response.Body then
            local decodeSuccess, decodedData = pcall(function()
                return hs:JSONDecode(response.Body)
            end)
            if decodeSuccess and decodedData then
                return decodedData.success
            end
        end
    else
        -- Yoo http_request hin jirre PostAsync fayyadamuu
        local success, response = pcall(function()
            return hs:PostAsync(
                API_URL, 
                payload, 
                Enum.HttpContentType.ApplicationJson
            )
        end)
        
        if success then
            local decodeSuccess, decodedData = pcall(function()
                return hs:JSONDecode(response)
            end)
            if decodeSuccess and decodedData then
                return decodedData.success
            end
        end
    end
    return false
end

-- Tạo giao diện nhập Key
if cg:FindFirstChild("KeySystemGui") then
    cg.KeySystemGui:Destroy()
end

local keyGui = Instance.new("ScreenGui")
keyGui.Name = "KeySystemGui"
keyGui.Parent = cg

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 320, 0, 215) -- Tăng chiều cao để chứa nút Discord
mainFrame.Position = UDim2.new(0.5, -160, 0.5, -107)
mainFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = keyGui

local frameCorner = Instance.new("UICorner")
frameCorner.CornerRadius = UDim.new(0, 8)
frameCorner.Parent = mainFrame

local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, 0, 0, 40)
titleLabel.BackgroundTransparency = 1
titleLabel.Font = Enum.Font.GothamBold
titleLabel.Text = "Xác Thực Key - Minerscraft"
titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
titleLabel.TextSize = 16
titleLabel.Parent = mainFrame

local keyBox = Instance.new("TextBox")
keyBox.Size = UDim2.new(0.85, 0, 0, 35)
keyBox.Position = UDim2.new(0.075, 0, 0, 45)
keyBox.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
keyBox.BorderSizePixel = 0
keyBox.Font = Enum.Font.Gotham
keyBox.PlaceholderText = "Nhập key vào đây..."
keyBox.Text = ""
keyBox.TextColor3 = Color3.fromRGB(255, 255, 255)
keyBox.TextSize = 14
keyBox.Parent = mainFrame

local boxCorner = Instance.new("UICorner")
boxCorner.CornerRadius = UDim.new(0, 6)
boxCorner.Parent = keyBox

local submitBtn = Instance.new("TextButton")
submitBtn.Size = UDim2.new(0.85, 0, 0, 35)
submitBtn.Position = UDim2.new(0.075, 0, 0, 88)
submitBtn.BackgroundColor3 = Color3.fromRGB(0, 150, 255)
submitBtn.BorderSizePixel = 0
submitBtn.Font = Enum.Font.GothamBold
submitBtn.Text = "Xác Nhận Key"
submitBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
submitBtn.TextSize = 14
submitBtn.Parent = mainFrame

local btnCorner = Instance.new("UICorner")
btnCorner.CornerRadius = UDim.new(0, 6)
btnCorner.Parent = submitBtn

-- Nút Join Discord / Copy Link (Bằng tiếng Anh theo yêu cầu)
local discordBtn = Instance.new("TextButton")
discordBtn.Size = UDim2.new(0.85, 0, 0, 32)
discordBtn.Position = UDim2.new(0.075, 0, 0, 130)
discordBtn.BackgroundColor3 = Color3.fromRGB(88, 101, 242) -- Màu đặc trưng của Discord (Blurple)
discordBtn.BorderSizePixel = 0
discordBtn.Font = Enum.Font.GothamBold
discordBtn.Text = "Join Discord for Key"
discordBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
discordBtn.TextSize = 13
discordBtn.Parent = mainFrame

local discordCorner = Instance.new("UICorner")
discordCorner.CornerRadius = UDim.new(0, 6)
discordCorner.Parent = discordBtn

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(1, 0, 0, 20)
statusLabel.Position = UDim2.new(0, 0, 0, 175)
statusLabel.BackgroundTransparency = 1
statusLabel.Font = Enum.Font.Gotham
statusLabel.Text = ""
statusLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
statusLabel.TextSize = 12
statusLabel.Parent = mainFrame

local keyVerified = false

-- Xử lý sự kiện bấm nút Discord để copy link
discordBtn.MouseButton1Click:Connect(function()
    local discordLink = "https://discord.gg/MYAVzEtgh"
    if setclipboard then
        setclipboard(discordLink)
        statusLabel.TextColor3 = Color3.fromRGB(80, 255, 255)
        statusLabel.Text = "Copied Discord link to clipboard!"
    else
        statusLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        statusLabel.Text = "Link: " .. discordLink
    end
end)

submitBtn.MouseButton1Click:Connect(function()
    statusLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    statusLabel.Text = "Đang kiểm tra key trên hệ thống..."
    
    local isValid = verifyKeyWithServer(keyBox.Text)
    
    if isValid then
        keyVerified = true
        statusLabel.TextColor3 = Color3.fromRGB(80, 255, 80)
        statusLabel.Text = "Thành công! Đang tải menu..."
        task.wait(0.5)
        keyGui:Destroy()
    else
        statusLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
        statusLabel.Text = "Sai key hoặc lỗi kết nối!"
    end
end)

-- Đợi xác thực thành công từ API mới cho chạy tiếp
repeat task.wait(0.5) until keyVerified

-- =========================================================
-- 1. TẢI VÀ KHỞI TẠO INVENTORY VIEWER V2
-- =========================================================
local invViewerGui = nil

local success, err = pcall(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/screengui/archives/main/inv-viewerV2.lua", true))()
end)

if not success then
    warn("Không thể tải giao diện Inventory Viewer:", err)
else
    local playerGui = lp:WaitForChild("PlayerGui", 5)
    if playerGui then
        invViewerGui = playerGui:WaitForChild("invviewer", 5)
        if invViewerGui then
            invViewerGui.Enabled = false 
            
            local uiScale = invViewerGui:FindFirstChild("CustomUIScale")
            if not uiScale then
                uiScale = Instance.new("UIScale")
                uiScale.Name = "CustomUIScale"
                uiScale.Scale = 1.15 
                uiScale.Parent = invViewerGui
            end
        end
    end
end

local function updateInventoryViewerTarget(playerName)
    if not invViewerGui then return end
    invViewerGui.Enabled = true

    task.spawn(function()
        task.wait(0.15)
        local textBox = invViewerGui:FindFirstChildWhichIsA("TextBox", true)
        if textBox then
            textBox.Text = playerName
            if getgenv and firefocuslost then
                pcall(function() firefocuslost(textBox, true) end)
            else
                pcall(function() textBox:ReleaseFocus(true) end)
            end
        end

        task.wait(0.1)
        local searchButton = nil
        for _, btn in ipairs(invViewerGui:GetDescendants()) do
            if btn:IsA("TextButton") or btn:IsA("ImageButton") then
                local btnName = btn.Name:lower()
                local btnText = (btn:IsA("TextButton") and btn.Text:lower()) or ""
                if btnName:find("search") or btnName:find("view") or btnName:find("find") or
                   btnText:find("search") or btnText:find("view") or btnText:find("find") then
                    searchButton = btn
                    break
                end
            end
        end

        if not searchButton and textBox then
            local parentFrame = textBox.Parent
            if parentFrame then
                for _, child in ipairs(parentFrame:GetChildren()) do
                    if (child:IsA("TextButton") or child:IsA("ImageButton")) and child ~= textBox then
                        searchButton = child
                        break
                    end
                end
            end
        end

        if searchButton then
            if getgenv and firesignal and searchButton.MouseButton1Click then
                pcall(function() firesignal(searchButton.MouseButton1Click) end)
            elseif getgenv and clicksig then
                pcall(function() clicksig(searchButton) end)
            else
                pcall(function()
                    for _, conn in ipairs(getconnections(searchButton.MouseButton1Click)) do
                        conn:Fire()
                    end
                end)
            end
        end
    end)
end

local function hideInventoryViewer()
    if invViewerGui then
        invViewerGui.Enabled = false
    end
end

-- =========================================================
-- 2. CẤU HÌNH & HÀM BỔ TRỢ EXPLOIT
-- =========================================================
local selectedInv = nil
local selectedPlayerName = ""
local FOOD_LIST = {"Banana", "Apple", "Bread", "Meat", "Pork", "Steak"}

local function msg(t) 
    g:GetService("StarterGui"):SetCore("SendNotification", {
        Title = 'Minerscraft Exploiter', 
        Text = t,
        Duration = 3
    }) 
end

local function isFood(str)
    for _, food in ipairs(FOOD_LIST) do
        if str:find(food, 1, true) then
            return true
        end
    end
    return false
end

local function playerHasFood(player)
    if player == lp or not player.Character then return false end
    
    local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
    if not humanoid or humanoid.Health <= 0 then return false end

    local inv = player.Character:FindFirstChild("Inventory")
    if not inv or #inv:GetChildren() == 0 then return false end

    for _, v in ipairs(inv:GetChildren()) do
        if v:IsA("ValueObject") or v:FindFirstChild("Value") or type(v.Value) == "string" then
            local val = v.Value
            if type(val) == "string" and isFood(val) then
                local success, data = pcall(function()
                    return hs:JSONDecode(val)
                end)
                if success and type(data) == "table" and data.count and data.count > 0 then
                    return true 
                end
            end
        end
    end
    return false
end

-- =========================================================
-- 3. GIAO DIỆN KAVO UI
-- =========================================================
local ui = loadstring(g:HttpGet("https://raw.githubusercontent.com/VeztWare/KavoUi/main/KavoUi.lua"))()
local window = ui.CreateLib("Minerscraft Inventory Exploiter", "DarkTheme")
local mainTab = window:NewTab("Main")
local targetSection = mainTab:NewSection("Target & Copy")

local function getValidFoodPlayers()
    local list = {}
    for _, p in ipairs(P:GetPlayers()) do
        if playerHasFood(p) then
            table.insert(list, p.Name)
        end
    end
    if #list == 0 then
        table.insert(list, "Không có ai có Food")
    end
    return list
end

local playerDropdown = targetSection:NewDropdown("Chọn Target (Chỉ có Food)", "Chỉ hiển thị người chơi có đồ ăn", getValidFoodPlayers(), function(selected)
    selectedPlayerName = selected
    local targetPlayer = P:FindFirstChild(selected)
    
    if targetPlayer and targetPlayer.Character and targetPlayer.Character:FindFirstChild("Inventory") then
        selectedInv = targetPlayer.Character.Inventory
        msg("Đã chọn Target: " .. selected)
        updateInventoryViewerTarget(selected)
    else
        selectedInv = nil
        hideInventoryViewer()
    end
end)

targetSection:NewButton("🔄 Cập nhật danh sách Target", "Làm mới danh sách", function()
    local newList = getValidFoodPlayers()
    playerDropdown:Refresh(newList)
    msg("Đã cập nhật danh sách! Có " .. (#newList == 1 and newList[1] == "Không có ai có Food" and 0 or #newList) .. " người hợp lệ.")
end)

targetSection:NewButton("📋 Copy Inventory", "Mục tiêu phải có đồ ăn & Bạn phải đang đói", function()
    local hungerVal = lp:FindFirstChild("Hunger") or (lp.Character and lp.Character:FindFirstChild("Hunger"))
    if hungerVal and hungerVal.Value >= 100 then 
        return msg("Bạn đang no! Cần Hunger < 100 để thực hiện") 
    end
    
    if not selectedInv or not selectedInv.Parent then 
        return msg("Chưa chọn Target hợp lệ hoặc người đó đã thoát/chết!") 
    end

    local ci = g:GetService("ReplicatedStorage"):WaitForChild("GameRemotes"):WaitForChild("ConsumeItem")
    for _, v in ipairs(selectedInv:GetChildren()) do
        if v:IsA("ValueObject") or v:FindFirstChild("Value") or type(v.Value) == "string" then
            local val = v.Value
            if type(val) == "string" and isFood(val) then
                local success, data = pcall(function() return hs:JSONDecode(val) end)
                if success and type(data) == "table" and data.count and data.count > 0 then
                    local slotNum = tonumber(v.Name:match("%d+"))
                    if slotNum then
                        local invokeSuccess, err = pcall(function()
                            ci:InvokeServer(selectedInv, slotNum)
                        end)
                        if invokeSuccess then
                            msg("THÀNH CÔNG! Đang tự động Rejoin server...")
                            task.wait(1.5)
                            ts:TeleportToPlaceInstance(g.PlaceId, g.JobId, lp)
                            return
                        else
                            return msg("Lỗi Invoke: " .. tostring(err))
                        end
                    end
                end
            end
        end
    end
    msg("Target không còn item đồ ăn hợp lệ hoặc đã mất đồ do chết!")
end)

local settingsSection = mainTab:NewSection("Cài đặt phím tắt (PC)")
settingsSection:NewKeybind("Phím tắt đóng/mở", "Dành cho PC (Mặc định: RightShift)", Enum.KeyCode.RightShift, function()
    ui:ToggleUI()
end)

-- =========================================================
-- 4. TẠO NÚT BẤM NỔI (FLOATING BUTTON)
-- =========================================================
if cg:FindFirstChild("ToggleExploitGui") then
    cg.ToggleExploitGui:Destroy()
end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "ToggleExploitGui"
screenGui.Parent = cg

local toggleBtn = Instance.new("TextButton")
toggleBtn.Name = "ToggleButton"
toggleBtn.Parent = screenGui
toggleBtn.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
toggleBtn.BorderColor3 = Color3.fromRGB(0, 150, 255)
toggleBtn.BorderSizePixel = 2
toggleBtn.Position = UDim2.new(0, 10, 0, 10)
toggleBtn.Size = UDim2.new(0, 130, 0, 40)
toggleBtn.Font = Enum.Font.GothamBold
toggleBtn.Text = "Đóng/Mở Menu"
toggleBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
toggleBtn.TextSize = 14
toggleBtn.Active = true
toggleBtn.Draggable = true

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 6)
corner.Parent = toggleBtn

toggleBtn.MouseButton1Click:Connect(function()
    ui:ToggleUI()
end)
