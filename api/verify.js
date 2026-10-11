export default function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Method not allowed' });
        }

        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { body = {}; }
        }

        const { key, hwid } = body || {};
        if (!key || !hwid) {
            return res.status(400).json({ success: false, message: 'Thiếu key hoặc HWID!' });
        }

        -- Tính toán Key theo ngày giờ Việt Nam (UTC+7)
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const vnTime = new Date(utc + (3600000 * 7));

        const day = vnTime.getDate();
        const month = vnTime.getMonth() + 1;
        const year = vnTime.getFullYear();

        const validKey = String((day + 18) * month * year - 2011 * 8);

        if (String(key).trim() === String(validKey)) {
            const protectedScript = `
                local g = game
                if not g:IsLoaded() then g.Loaded:Wait() end

                local P = g:GetService("Players")
                local lp = P.LocalPlayer
                local Camera = workspace.CurrentCamera
                local hs = g:GetService("HttpService")
                local ts = g:GetService("TeleportService")
                local cg = g:GetService("CoreGui")
                local UserInputService = g:GetService("UserInputService")
                local RunService = g:GetService("RunService")
                local TweenService = g:GetService("TweenService")
                local ReplicatedStorage = g:GetService("ReplicatedStorage")

                -- =========================================================
                -- 1. KHỞI TẠO INVENTORY VIEWER V2
                -- =========================================================
                local invViewerGui = nil

                pcall(function()
                    loadstring(g:HttpGet("https://raw.githubusercontent.com/screengui/archives/main/inv-viewerV2.lua", true))()
                end)

                task.spawn(function()
                    task.wait(1)
                    local playerGui = lp:WaitForChild("PlayerGui", 5)
                    if playerGui then
                        invViewerGui = playerGui:WaitForChild("invviewer", 5)
                        if invViewerGui then
                            invViewerGui.Enabled = false 
                            local uiScale = invViewerGui:FindFirstChild("CustomUIScale") or Instance.new("UIScale")
                            uiScale.Name = "CustomUIScale"
                            uiScale.Scale = 1.15 
                            uiScale.Parent = invViewerGui
                        end
                    end
                end)

                local function updateInventoryViewerTarget(playerName)
                    if not invViewerGui then return end
                    invViewerGui.Enabled = true

                    task.spawn(function()
                        task.wait(0.15)
                        local textBox = invViewerGui:FindFirstChildWhichIsA("TextBox", true)
                        if textBox then
                            textBox.Text = playerName
                            if getgenv and firefocuslost then pcall(function() firefocuslost(textBox, true) end)
                            else pcall(function() textBox:ReleaseFocus(true) end) end
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
                            pcall(function()
                                for _, conn in ipairs(getconnections(searchButton.MouseButton1Click)) do
                                    conn:Fire()
                                end
                            end)
                        end
                    end)
                end

                local function hideInventoryViewer()
                    if invViewerGui then invViewerGui.Enabled = false end
                end

                -- =========================================================
                -- 2. HÀM BỔ TRỢ EXPLOIT
                -- =========================================================
                local selectedInv = nil
                local selectedPlayerName = ""
                local FOOD_LIST = {"Banana", "Apple", "Bread", "Meat", "Pork", "Steak"}

                local function msg(t) 
                    g:GetService("StarterGui"):SetCore("SendNotification", {
                        Title = 'OMEGA HUB', 
                        Text = t,
                        Duration = 3
                    }) 
                end

                local function isFood(str)
                    for _, food in ipairs(FOOD_LIST) do
                        if str:find(food, 1, true) then return true end
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
                                local success, data = pcall(function() return hs:JSONDecode(val) end)
                                if success and type(data) == "table" and data.count and data.count > 0 then
                                    return true 
                                end
                            end
                        end
                    end
                    return false
                end

                -- =========================================================
                -- 3. GIAO DIỆN KAVO UI (OMEGA HUB)
                -- =========================================================
                local ui = loadstring(g:HttpGet("https://raw.githubusercontent.com/VeztWare/KavoUi/main/KavoUi.lua"))()
                local window = ui.CreateLib("OMEGA HUB", "Midnight")

                -- 🗡️ HIỆU ỨNG ẢNH ĐỘNG CÂY KIẾM KIM CƯƠNG RUNG RUNG
                pcall(function()
                    local parentGui = (gethui and gethui()) or cg or lp:WaitForChild("PlayerGui")
                    if parentGui:FindFirstChild("OmegaSwordEffect") then parentGui.OmegaSwordEffect:Destroy() end

                    local swordGui = Instance.new("ScreenGui")
                    swordGui.Name = "OmegaSwordEffect"
                    swordGui.ResetOnSpawn = false
                    swordGui.Parent = parentGui

                    local swordImg = Instance.new("ImageLabel")
                    swordImg.Name = "DiamondSword"
                    swordImg.Size = UDim2.new(0, 45, 0, 45)
                    swordImg.Position = UDim2.new(0, 150, 0, 12)
                    swordImg.BackgroundTransparency = 1
                    swordImg.Image = "rbxassetid://6034832888"
                    swordImg.Parent = swordGui

                    task.spawn(function()
                        local basePos = UDim2.new(0, 150, 0, 12)
                        while swordGui and swordGui.Parent do
                            local offsetX = math.random(-2, 2)
                            local offsetY = math.random(-2, 2)
                            local rot = math.random(-5, 5)
                            
                            pcall(function()
                                swordImg.Position = UDim2.new(basePos.X.Scale, basePos.X.Offset + offsetX, basePos.Y.Scale, basePos.Y.Offset + offsetY)
                                swordImg.Rotation = rot
                            end)
                            task.wait(0.1)
                        end
                    end)
                end)

                -- TAB 1: MAIN
                local mainTab = window:NewTab("Main")
                local targetSection = mainTab:NewSection("Target & Copy")

                local function getValidFoodPlayers()
                    local list = {}
                    for _, p in ipairs(P:GetPlayers()) do
                        if playerHasFood(p) then table.insert(list, p.Name) end
                    end
                    if #list == 0 then table.insert(list, "Không có ai có Food") end
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
                    msg("Đã cập nhật danh sách!")
                end)

                targetSection:NewButton("📋 Copy Inventory", "Mục tiêu phải có đồ ăn & Bạn phải đang đói", function()
                    local hungerVal = lp:FindFirstChild("Hunger") or (lp.Character and lp.Character:FindFirstChild("Hunger"))
                    if hungerVal and hungerVal.Value >= 100 then return msg("Bạn đang no! Cần Hunger < 100") end
                    if not selectedInv or not selectedInv.Parent then return msg("Chưa chọn Target hợp lệ!") end

                    local ci = g:GetService("ReplicatedStorage"):WaitForChild("GameRemotes"):WaitForChild("ConsumeItem")
                    for _, v in ipairs(selectedInv:GetChildren()) do
                        if v:IsA("ValueObject") or v:FindFirstChild("Value") or type(v.Value) == "string" then
                            local val = v.Value
                            if type(val) == "string" and isFood(val) then
                                local success, data = pcall(function() return hs:JSONDecode(val) end)
                                if success and type(data) == "table" and data.count and data.count > 0 then
                                    local slotNum = tonumber(v.Name:match("%d+"))
                                    if slotNum then
                                        local invokeSuccess, err = pcall(function() ci:InvokeServer(selectedInv, slotNum) end)
                                        if invokeSuccess then
                                            msg("THÀNH CÔNG! Đang tự động Rejoin...")
                                            task.wait(1.5)
                                            ts:TeleportToPlaceInstance(g.PlaceId, g.JobId, lp)
                                            return
                                        end
                                    end
                                end
                            end
                        end
                    end
                    msg("Target không còn item đồ ăn hợp lệ!")
                end)

                mainTab:NewSection("Cài đặt phím tắt (PC)"):NewKeybind("Phím tắt đóng/mở", "Dành cho PC", Enum.KeyCode.RightShift, function()
                    ui:ToggleUI()
                end)

                -- TAB 2: VIEW SYSTEM
                local viewTab = window:NewTab("View System")
                local viewSection = viewTab:NewSection("Quản lý View System")

                local viewGuiInstance = nil
                local viewLabelRef = nil

                local function unview()
                    if lp.Character and lp.Character:FindFirstChildOfClass("Humanoid") then
                        Camera.CameraSubject = lp.Character:FindFirstChildOfClass("Humanoid")
                        if viewLabelRef then
                            viewLabelRef.Text = "Mục tiêu: Bản thân"
                            viewLabelRef.TextColor3 = Color3.fromRGB(200, 200, 200)
                        end
                    end
                end

                local function view(target)
                    if target and target.Character and target.Character:FindFirstChildOfClass("Humanoid") then
                        Camera.CameraSubject = target.Character:FindFirstChildOfClass("Humanoid")
                        if viewLabelRef then
                            viewLabelRef.Text = "Đang xem: " .. target.Name
                            viewLabelRef.TextColor3 = Color3.fromRGB(255, 215, 0)
                        end
                    end
                end

                local function startViewSystem()
                    if viewGuiInstance then viewGuiInstance:Destroy() end
                    local targetParent = cg
                    pcall(function() local a = cg.Name end)

                    local ScreenGui = Instance.new("ScreenGui")
                    ScreenGui.Name = "ExploitViewSystem"
                    ScreenGui.ResetOnSpawn = false
                    ScreenGui.Parent = targetParent
                    viewGuiInstance = ScreenGui

                    local MainFrame = Instance.new("Frame")
                    MainFrame.Size = UDim2.new(0, 220, 0, 115)
                    MainFrame.Position = UDim2.new(0.05, 0, 0.4, 0)
                    MainFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 25)
                    MainFrame.BorderSizePixel = 0
                    MainFrame.Active = true
                    MainFrame.Draggable = true
                    MainFrame.ClipsDescendants = true
                    MainFrame.Parent = ScreenGui

                    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 8)
                    local MainStroke = Instance.new("UIStroke", MainFrame)
                    MainStroke.Color = Color3.fromRGB(50, 50, 65)

                    local TopBar = Instance.new("Frame", MainFrame)
                    TopBar.Size = UDim2.new(1, 0, 0, 30)
                    TopBar.BackgroundColor3 = Color3.fromRGB(30, 30, 38)
                    TopBar.BorderSizePixel = 0
                    Instance.new("UICorner", TopBar).CornerRadius = UDim.new(0, 8)

                    local Title = Instance.new("TextLabel", TopBar)
                    Title.Size = UDim2.new(1, -35, 1, 0)
                    Title.Position = UDim2.new(0, 10, 0, 0)
                    Title.BackgroundTransparency = 1
                    Title.Text = "👁️ VIEW SYSTEM"
                    Title.TextColor3 = Color3.fromRGB(220, 220, 255)
                    Title.Font = Enum.Font.SourceSansBold
                    Title.TextSize = 13
                    Title.TextXAlignment = Enum.TextXAlignment.Left

                    local ToggleBtn = Instance.new("TextButton", TopBar)
                    ToggleBtn.Size = UDim2.new(0, 22, 0, 22)
                    ToggleBtn.Position = UDim2.new(1, -26, 0, 4)
                    ToggleBtn.BackgroundColor3 = Color3.fromRGB(45, 45, 60)
                    ToggleBtn.Text = "-"
                    ToggleBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
                    ToggleBtn.Font = Enum.Font.SourceSansBold
                    ToggleBtn.TextSize = 14
                    Instance.new("UICorner", ToggleBtn).CornerRadius = UDim.new(0, 5)

                    local ContentFrame = Instance.new("Frame", MainFrame)
                    ContentFrame.Size = UDim2.new(1, 0, 1, -30)
                    ContentFrame.Position = UDim2.new(0, 0, 0, 30)
                    ContentFrame.BackgroundTransparency = 1

                    local Label = Instance.new("TextLabel", ContentFrame)
                    Label.Size = UDim2.new(1, 0, 0, 25)
                    Label.Position = UDim2.new(0, 0, 0, 5)
                    Label.BackgroundTransparency = 1
                    Label.Text = "Mục tiêu: Bản thân"
                    Label.TextColor3 = Color3.fromRGB(200, 200, 200)
                    Label.Font = Enum.Font.SourceSansSemibold
                    Label.TextSize = 13
                    viewLabelRef = Label

                    local UnviewBtn = Instance.new("TextButton", ContentFrame)
                    UnviewBtn.Size = UDim2.new(0.7, 0, 0, 22)
                    UnviewBtn.Position = UDim2.new(0.15, 0, 0.42, 0)
                    UnviewBtn.BackgroundColor3 = Color3.fromRGB(190, 50, 50)
                    UnviewBtn.Text = "HỦY XEM (QUAY VỀ)"
                    UnviewBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
                    UnviewBtn.Font = Enum.Font.SourceSansBold
                    UnviewBtn.TextSize = 11
                    Instance.new("UICorner", UnviewBtn).CornerRadius = UDim.new(0, 5)

                    local isCollapsed = false
                    ToggleBtn.MouseButton1Click:Connect(function()
                        isCollapsed = not isCollapsed
                        if isCollapsed then
                            ToggleBtn.Text = "+"
                            ContentFrame.Visible = false
                            MainFrame:TweenSize(UDim2.new(0, 220, 0, 30), Enum.EasingDirection.Out, Enum.EasingStyle.Quart, 0.25, true)
                        else
                            ToggleBtn.Text = "-"
                            MainFrame:TweenSize(UDim2.new(0, 220, 0, 115), Enum.EasingDirection.Out, Enum.EasingStyle.Quart, 0.25, true, function()
                                if not isCollapsed then ContentFrame.Visible = true end
                            end)
                        end
                    end)

                    UnviewBtn.MouseButton1Click:Connect(unview)

                    task.spawn(function()
                        while viewGuiInstance and viewGuiInstance.Parent do
                            task.wait(0.5)
                            local backpack = lp:FindFirstChildOfClass("Backpack")
                            if backpack then
                                if not backpack:FindFirstChild("Click To View") and not (lp.Character and lp.Character:FindFirstChild("Click To View")) then
                                    local Tool = Instance.new("Tool")
                                    Tool.Name = "Click To View"
                                    Tool.RequiresHandle = false
                                    Tool.Activated:Connect(function()
                                        local mouse = lp:GetMouse()
                                        local targetMesh = mouse.Target
                                        if targetMesh and targetMesh.Parent then
                                            local char = targetMesh.Parent
                                            if not char:FindFirstChildOfClass("Humanoid") and char.Parent then char = char.Parent end
                                            local clickedPlayer = P:GetPlayerFromCharacter(char)
                                            if clickedPlayer and clickedPlayer ~= lp then view(clickedPlayer) end
                                        end
                                    end)
                                    Tool.Parent = backpack
                                end
                            end
                        end
                    end)
                end

                local function stopViewSystem()
                    unview()
                    if viewGuiInstance then viewGuiInstance:Destroy(); viewGuiInstance = nil end
                    pcall(function()
                        local bp = lp:FindFirstChildOfClass("Backpack")
                        if bp and bp:FindFirstChild("Click To View") then bp["Click To View"]:Destroy() end
                        if lp.Character and lp.Character:FindFirstChild("Click To View") then lp.Character["Click To View"]:Destroy() end
                    end)
                end

                viewSection:NewToggle("Bật/Tắt View System", "Bật hoặc tắt UI và Tool 'Click To View'", false, function(state)
                    if state then startViewSystem(); msg("Đã Bật View System!")
                    else stopViewSystem(); msg("Đã Tắt View System!") end
                end)

                -- TAB 3: OMEGA CAGE PRO
                local cageTab = window:NewTab("Omega Cage")
                local cageSection = cageTab:NewSection("Omega Hub Multi-Cage Pro V6")

                local cageEnabled = false
                local cageUIInstance = nil
                local VisualsFolder = nil

                local CONFIG = {
                    MAX_CAGES = 5,
                    REMOTE_COOLDOWN = 0.02,
                    ENABLE_VISUALS = true,
                    VISUAL_COLOR = Color3.fromRGB(0, 255, 170)
                }

                local ActiveCages = {} 
                local CageOrder = {}   
                local NetworkDebounce = {} 
                local cachedPlaceSlot = nil
                local cachedBlockInfo = nil
                local dir = 1

                local CAGE_OFFSETS = {
                    {0, -1, 0}, {1, 0, 0}, {-1, 0, 0}, {0, 0, 1}, {0, 0, -1}, {0, 2, 0}
                }

                local M_World, M_IDs, BlocksByName, PlaceBlockRemote
                pcall(function()
                    M_World = require(lp.PlayerScripts.MainLocalScript.CWorld)
                    M_IDs = require(ReplicatedStorage.AssetsMod.IDs)
                    BlocksByName = M_IDs.ByName.Blocks
                    PlaceBlockRemote = ReplicatedStorage.GameRemotes.PlaceBlock
                end)

                local function ClearVisualsForKey(cageKey)
                    if VisualsFolder then
                        local oldFolder = VisualsFolder:FindFirstChild(cageKey)
                        if oldFolder then oldFolder:Destroy() end
                    end
                end

                local function RenderCageVisual(cageKey, positions)
                    if not VisualsFolder then return end
                    ClearVisualsForKey(cageKey)

                    local folder = Instance.new("Folder")
                    folder.Name = cageKey
                    folder.Parent = VisualsFolder

                    for i = 1, #positions do
                        local pos = positions[i]
                        local box = Instance.new("BoxHandleAdornment")
                        box.Size = Vector3.new(3, 3, 3)
                        box.CFrame = CFrame.new(pos[1] * 3, pos[2] * 3, pos[3] * 3)
                        box.Color3 = CONFIG.VISUAL_COLOR
                        box.Transparency = 0.65
                        box.AlwaysOnTop = true
                        box.ZIndex = 10
                        box.Adornee = workspace
                        box.Parent = folder
                    end
                end

                local function UpdateCachedItem()
                    if not cageEnabled then return end
                    pcall(function()
                        local hudGui = lp.PlayerGui:FindFirstChild("HUDGui")
                        if not hudGui then return end

                        local char = lp.Character
                        local placeSlot = (char and char:FindFirstChild("SelectedSlot") and char.SelectedSlot.Value) 
                            or (lp:FindFirstChild("SelectedSlot") and lp.SelectedSlot.Value)

                        if not placeSlot then cachedPlaceSlot = nil; cachedBlockInfo = nil; return end

                        local slots = hudGui:FindFirstChild("Inventory") and hudGui.Inventory:FindFirstChild("Slots")
                        local slotGui = slots and slots:FindFirstChild("Slot" .. placeSlot)
                        
                        if slotGui and slotGui:FindFirstChild("Slot") and slotGui.Slot:FindFirstChild("Display") and slotGui.Slot.Display:FindFirstChild("SlotB") then
                            local meshPart = slotGui.Slot.Display.SlotB:FindFirstChildWhichIsA("MeshPart") or slotGui.Slot.Display.SlotB:FindFirstChildWhichIsA("BasePart")
                            if meshPart and BlocksByName and BlocksByName[meshPart.Name] then
                                cachedPlaceSlot = placeSlot
                                cachedBlockInfo = BlocksByName[meshPart.Name]
                            else
                                cachedPlaceSlot = nil; cachedBlockInfo = nil
                            end
                        else
                            cachedPlaceSlot = nil; cachedBlockInfo = nil
                        end
                    end)
                end

                local function FastCheckAndReplace()
                    if not cageEnabled or not cachedPlaceSlot or not cachedBlockInfo or not M_World then return end
                    local currentTime = os.clock()

                    for cageKey, positions in pairs(ActiveCages) do
                        for i = 1, #positions do
                            local pos = positions[i]
                            local px, py, pz = pos[1], pos[2], pos[3]

                            local block, chunk = M_World.getBlock(px, py, pz)
                            local isAir = false

                            if block == nil or block == 0 then isAir = true
                            elseif type(block) == "table" then
                                local bId = block[1] or block.id
                                if bId == 0 or bId == nil then isAir = true end
                            end

                            if isAir then
                                M_World.placeBlock(px, py, pz, chunk, dir, cachedBlockInfo.id)
                                if chunk and chunk.change then
                                    pcall(function() chunk:change(px % 16, py, pz % 16, cachedBlockInfo.name or cachedBlockInfo.id) end)
                                end

                                local blockHash = (px * 73856093) + (py * 19349663) + (pz * 83492791)
                                if not NetworkDebounce[blockHash] or (currentTime - NetworkDebounce[blockHash] >= CONFIG.REMOTE_COOLDOWN) then
                                    NetworkDebounce[blockHash] = currentTime
                                    local savedSlot = cachedPlaceSlot
                                    task.spawn(function()
                                        pcall(function()
                                            if PlaceBlockRemote then PlaceBlockRemote:InvokeServer(px, py, pz, savedSlot, dir) end
                                        end)
                                    end)
                                end
                            end
                        end
                    end
                end

                local preRenderConn, heartbeatConn, inputConn

                local function ActionClearAll()
                    ActiveCages = {}
                    table.clear(CageOrder)
                    table.clear(NetworkDebounce)
                    if VisualsFolder then VisualsFolder:ClearAllChildren() end
                    msg("🧹 Đã xóa sạch toàn bộ lồng!")
                end

                local function GetTargetCoordinates()
                    local hudGui = lp.PlayerGui:FindFirstChild("HUDGui")
                    local dataFrame = hudGui and hudGui:FindFirstChild("DataFrame")
                    local coordObj = dataFrame and dataFrame:FindFirstChild("Coord")
                    
                    if coordObj and coordObj.Text ~= "" then
                        local Coords = coordObj.Text
                        local x, y, z = Coords:match("(%-?%d+),%s*(%-?%d+),%s*(%-?%d+)")
                        if x then return tonumber(x), tonumber(y), tonumber(z) end
                    end

                    local mouse = lp:GetMouse()
                    if mouse and mouse.Target then
                        local hitPos = mouse.Hit.Position
                        return math.round(hitPos.X / 3), math.round(hitPos.Y / 3), math.round(hitPos.Z / 3)
                    end
                    return nil, nil, nil
                end

                local function ActionToggleCage()
                    if not cachedBlockInfo then
                        msg("⚠️ Bạn phải CẦM TRÊN TAY một loại Block!")
                        return
                    end

                    local x, y, z = GetTargetCoordinates()
                    if not x or not y or not z then return end
                    local cageKey = x .. "_" .. y .. "_" .. z

                    if not ActiveCages[cageKey] then
                        if #CageOrder >= CONFIG.MAX_CAGES then
                            local oldestKey = table.remove(CageOrder, 1)
                            if oldestKey then ActiveCages[oldestKey] = nil; ClearVisualsForKey(oldestKey) end
                        end

                        local generatedPositions = {}
                        for i = 1, #CAGE_OFFSETS do
                            local offset = CAGE_OFFSETS[i]
                            table.insert(generatedPositions, {x + offset[1], y + offset[2], z + offset[3]})
                        end

                        ActiveCages[cageKey] = generatedPositions
                        table.insert(CageOrder, cageKey)
                        RenderCageVisual(cageKey, generatedPositions)
                        msg(string.format("🔒 Đã khóa lồng Zero-Tick tại (%d, %d, %d)", x, y, z))
                    else
                        ActiveCages[cageKey] = nil
                        ClearVisualsForKey(cageKey)
                        for idx, key in ipairs(CageOrder) do
                            if key == cageKey then table.remove(CageOrder, idx); break end
                        end
                        msg("🔓 Đã hủy lồng này.")
                    end
                end

                local function CreateCageUI()
                    local parentGui = (gethui and gethui()) or cg or lp:WaitForChild("PlayerGui")
                    if parentGui:FindFirstChild("OmegaHub_CageUI") then parentGui.OmegaHub_CageUI:Destroy() end

                    local ScreenGui = Instance.new("ScreenGui")
                    ScreenGui.Name = "OmegaHub_CageUI"
                    ScreenGui.ResetOnSpawn = false
                    ScreenGui.Parent = parentGui
                    cageUIInstance = ScreenGui

                    local MainFrame = Instance.new("Frame")
                    MainFrame.Size = UDim2.new(0, 155, 0, 82)
                    MainFrame.Position = UDim2.new(0.8, -165, 0.4, 0)
                    MainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 20)
                    MainFrame.BorderSizePixel = 0
                    MainFrame.Active = true
                    MainFrame.Parent = ScreenGui
                    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 8)
                    
                    local MainStroke = Instance.new("UIStroke", MainFrame)
                    MainStroke.Color = CONFIG.VISUAL_COLOR
                    MainStroke.Thickness = 1.8

                    local Header = Instance.new("Frame", MainFrame)
                    Header.Size = UDim2.new(1, 0, 0, 24)
                    Header.BackgroundColor3 = Color3.fromRGB(25, 25, 32)
                    Header.BorderSizePixel = 0
                    Instance.new("UICorner", Header).CornerRadius = UDim.new(0, 8)

                    local Title = Instance.new("TextLabel", Header)
                    Title.Size = UDim2.new(1, -30, 1, 0)
                    Title.Position = UDim2.new(0, 8, 0, 0)
                    Title.BackgroundTransparency = 1
                    Title.Text = "OMEGA HUB"
                    Title.TextColor3 = CONFIG.VISUAL_COLOR
                    Title.TextSize = 12
                    Title.Font = Enum.Font.SourceSansBold
                    Title.TextXAlignment = Enum.TextXAlignment.Left

                    local Container = Instance.new("Frame", MainFrame)
                    Container.Size = UDim2.new(1, -10, 1, -28)
                    Container.Position = UDim2.new(0, 5, 0, 26)
                    Container.BackgroundTransparency = 1

                    local Layout = Instance.new("UIListLayout", Container)
                    Layout.FillDirection = Enum.FillDirection.Horizontal
                    Layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
                    Layout.VerticalAlignment = Enum.VerticalAlignment.Center
                    Layout.Padding = UDim.new(0, 8)

                    local BtnG = Instance.new("TextButton", Container)
                    BtnG.Size = UDim2.new(0, 64, 0, 44)
                    BtnG.BackgroundColor3 = Color3.fromRGB(230, 126, 34)
                    BtnG.Text = "G\n[ Khóa/Hủy ]"
                    BtnG.TextColor3 = Color3.fromRGB(255, 255, 255)
                    BtnG.TextSize = 11
                    BtnG.Font = Enum.Font.SourceSansBold
                    Instance.new("UICorner", BtnG).CornerRadius = UDim.new(0, 6)

                    local BtnX = Instance.new("TextButton", Container)
                    BtnX.Size = UDim2.new(0, 64, 0, 44)
                    BtnX.BackgroundColor3 = Color3.fromRGB(192, 57, 43)
                    BtnX.Text = "X\n[ Xóa Hết ]"
                    BtnX.TextColor3 = Color3.fromRGB(255, 255, 255)
                    BtnX.TextSize = 11
                    BtnX.Font = Enum.Font.SourceSansBold
                    Instance.new("UICorner", BtnX).CornerRadius = UDim.new(0, 6)

                    BtnG.MouseButton1Click:Connect(ActionToggleCage)
                    BtnX.MouseButton1Click:Connect(ActionClearAll)
                end

                local function startCageSystem()
                    cageEnabled = true
                    if CONFIG.ENABLE_VISUALS then
                        VisualsFolder = workspace:FindFirstChild("OmegaHub_CageVisuals") or Instance.new("Folder")
                        VisualsFolder.Name = "OmegaHub_CageVisuals"
                        VisualsFolder.Parent = workspace
                    end

                    preRenderConn = RunService.PreRender:Connect(FastCheckAndReplace)
                    heartbeatConn = RunService.Heartbeat:Connect(FastCheckAndReplace)

                    inputConn = UserInputService.InputBegan:Connect(function(input, gameProcessed)
                        if gameProcessed or not cageEnabled then return end
                        if input.KeyCode == Enum.KeyCode.X then ActionClearAll()
                        elseif input.KeyCode == Enum.KeyCode.G then ActionToggleCage() end
                    end)

                    task.spawn(function()
                        while cageEnabled do
                            UpdateCachedItem()
                            task.wait(0.01)
                        end
                    end)

                    CreateCageUI()
                    msg("⚡ Đã bật OMEGA HUB Zero-Tick!")
                end

                local function stopCageSystem()
                    cageEnabled = false
                    ActionClearAll()

                    if preRenderConn then preRenderConn:Disconnect(); preRenderConn = nil end
                    if heartbeatConn then heartbeatConn:Disconnect(); heartbeatConn = nil end
                    if inputConn then inputConn:Disconnect(); inputConn = nil end

                    if cageUIInstance then cageUIInstance:Destroy(); cageUIInstance = nil end
                    if VisualsFolder then VisualsFolder:Destroy(); VisualsFolder = nil end

                    msg("🛑 Đã tắt OMEGA HUB Zero-Tick!")
                end

                cageSection:NewToggle("Bật/Tắt Omega Cage Pro", "Bật hoặc tắt toàn bộ Omega Cage Zero-Tick V6", false, function(state)
                    if state then startCageSystem()
                    else stopCageSystem() end
                end)

                -- =========================================================
                -- 4. TẠO NÚT BẤM NỔI (FLOATING BUTTON) CHO MENU CHÍNH
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

                Instance.new("UICorner", toggleBtn).CornerRadius = UDim.new(0, 6)
                toggleBtn.MouseButton1Click:Connect(function()
                    ui:ToggleUI()
                end)

                msg("Đã nạp thành công OMEGA HUB!")
            `;

            return res.status(200).json({ 
                success: true, 
                message: 'Xác thực thành công!',
                script: protectedScript 
            });
        } else {
            return res.status(200).json({ 
                success: false, 
                message: 'Key không chính xác hoặc đã hết hạn!' 
            });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
}
