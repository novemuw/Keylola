local g = game
local P = g:GetService("Players")
local lp = P.LocalPlayer
local hs = g:GetService("HttpService")
local cg = g:GetService("CoreGui")
local RbxAnalyticsService = g:GetService("RbxAnalyticsService")

local API_URL = "https://keylola123.vercel.app/api/verify"

-- Lấy HWID thiết bị
local userHWID = "UNKNOWN_HWID"
pcall(function() userHWID = RbxAnalyticsService:GetClientId() end)

local http_request_func = (syn and syn.request) or (http and http.request) or request or (fluxus and fluxus.request)

local function verifyKeyWithServer(inputKey)
    local payload = hs:JSONEncode({ key = inputKey, hwid = userHWID })
    local responseBody = nil
    
    if http_request_func then
        local response = http_request_func({
            Url = API_URL,
            Method = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body = payload
        })
        if response and response.Body then responseBody = response.Body end
    else
        local success, response = pcall(function()
            return hs:PostAsync(API_URL, payload, Enum.HttpContentType.ApplicationJson)
        end)
        if success then responseBody = response end
    end

    if responseBody then
        local decodeSuccess, decodedData = pcall(function() return hs:JSONDecode(responseBody) end)
        if decodeSuccess and decodedData then
            return decodedData.success, decodedData.script, decodedData.message
        end
    end
    return false, nil, "Không thể kết nối máy chủ!"
end

if cg:FindFirstChild("KeySystemGui") then cg.KeySystemGui:Destroy() end

local keyGui = Instance.new("ScreenGui")
keyGui.Name = "KeySystemGui"
keyGui.Parent = cg

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 320, 0, 215)
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

local discordBtn = Instance.new("TextButton")
discordBtn.Size = UDim2.new(0.85, 0, 0, 32)
discordBtn.Position = UDim2.new(0.075, 0, 0, 130)
discordBtn.BackgroundColor3 = Color3.fromRGB(88, 101, 242)
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
    statusLabel.Text = "Đang kiểm tra key..."
    
    local isValid, downloadedScript, serverMsg = verifyKeyWithServer(keyBox.Text)
    
    if isValid and downloadedScript then
        statusLabel.TextColor3 = Color3.fromRGB(80, 255, 80)
        statusLabel.Text = "Thành công! Đang mở menu..."
        
        -- XÓA BẢNG KEY
        keyGui:Destroy()

        -- THỰC THI SCRIPT NHẬN VỀ TỪ VERCEL
        local func, err = loadstring(downloadedScript)
        if func then
            task.spawn(func)
        else
            warn("Lỗi biên dịch script:", err)
        end
    else
        statusLabel.TextColor3 = Color3.fromRGB(255, 80, 80)
        statusLabel.Text = serverMsg or "Key không hợp lệ!"
    end
end)
