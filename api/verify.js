export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { key, hwid } = req.body;
    if (!key || !hwid) {
        return res.status(400).json({ success: false, message: 'Thiếu key hoặc HWID!' });
    }

    // Thuật toán kiểm tra Key theo ngày UTC
    const now = new Date();
    const day = now.getUTCDate();
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();
    const validKey = String((day + 18) * month * year - 2011 * 8);

    if (key === validKey) {
        // ĐOẠN CODE MINERSCRAFT EXPLOITER HOÀN CHỈNH BẢO MẬT
        const protectedScript = `
            local g = game
            local P = g:GetService("Players")
            local lp = P.LocalPlayer
            local hs = g:GetService("HttpService")
            local ts = g:GetService("TeleportService")
            local cg = g:GetService("CoreGui")

            -- 1. TẢI VÀ KHỞI TẠO INVENTORY VIEWER V2
            local invViewerGui = nil
            local success, err = pcall(function()
                loadstring(game:HttpGet("https://raw.githubusercontent.com/screengui/archives/main/inv-viewerV2.lua", true))()
            end)

            if success then
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
            end

            local function updateInventoryViewerTarget(playerName)
                if not invViewerGui then return end
                invViewerGui.Enabled = true
                task.spawn(function()
                    task.wait(0.15)
                    local textBox = invViewerGui:FindFirstChildWhichIsA("TextBox", true)
                    if textBox then
                        textBox.Text = playerName
                        pcall(function() textBox:ReleaseFocus(true) end)
                    end
                    task.wait(0.1)
                    local searchButton = nil
                    for _, btn in ipairs(invViewerGui:GetDescendants()) do
                        if btn:IsA("TextButton") or btn:IsA("ImageButton") then
                            local btnName = btn.Name:lower()
                            if btnName:find("search") or btnName:find("view") or btnName:find("find") then
                                searchButton = btn
                                break
                            end
                        end
                    end
                    if searchButton and getconnections then
                        for _, conn in ipairs(getconnections(searchButton.MouseButton1Click)) do
                            conn:Fire()
                        end
                    end
                end)
            end

            local function hideInventoryViewer()
                if invViewerGui then invViewerGui.Enabled = false end
            end

            -- 2. CẤU HÌNH & HÀM BỔ TRỢ EXPLOIT
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
                    if (v:IsA("ValueObject") or v:FindFirstChild("Value") or type(v.Value) == "string") and isFood(v.Value) then
                        local s, data = pcall(function() return hs:JSONDecode(v.Value) end)
                        if s and type(data) == "table" and data.count and data.count > 0 then return true end
                    end
                end
                return false
            end

            -- 3. GIAO DIỆN KAVO UI
            local ui = loadstring(g:HttpGet("https://raw.githubusercontent.com/VeztWare/KavoUi/main/KavoUi.lua"))()
            local window = ui.CreateLib("Minerscraft Inventory Exploiter", "DarkTheme")
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
                msg("Đã cập nhật danh sách thành công!")
            end)

            targetSection:NewButton("📋 Copy Inventory", "Mục tiêu phải có đồ ăn & Bạn phải đang đói", function()
                local hungerVal = lp:FindFirstChild("Hunger") or (lp.Character and lp.Character:FindFirstChild("Hunger"))
                if hungerVal and hungerVal.Value >= 100 then return msg("Bạn đang no! Cần Hunger < 100 để thực hiện") end
                if not selectedInv or not selectedInv.Parent then return msg("Chưa chọn Target hợp lệ!") end

                local ci = g:GetService("ReplicatedStorage"):WaitForChild("GameRemotes"):WaitForChild("ConsumeItem")
                for _, v in ipairs(selectedInv:GetChildren()) do
                    if (v:IsA("ValueObject") or v:FindFirstChild("Value") or type(v.Value) == "string") and isFood(v.Value) then
                        local s, data = pcall(function() return hs:JSONDecode(v.Value) end)
                        if s and type(data) == "table" and data.count and data.count > 0 then
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
                msg("Target không còn item hợp lệ!")
            end)

            local settingsSection = mainTab:NewSection("Cài đặt phím tắt (PC)")
            settingsSection:NewKeybind("Phím tắt đóng/mở", "Dành cho PC", Enum.KeyCode.RightShift, function()
                ui:ToggleUI()
            end)

            -- 4. TẠO NÚT BẤM NỔI (FLOATING BUTTON)
            if cg:FindFirstChild("ToggleExploitGui") then cg.ToggleExploitGui:Destroy() end
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

            toggleBtn.MouseButton1Click:Connect(function() ui:ToggleUI() end)
            msg("Menu Minerscraft đã được nạp thành công!")
        `;

        return res.status(200).json({
            success: true,
            message: 'Xác thực thành công!',
            script: protectedScript
        });
    } else {
        return res.status(200).json({ success: false, message: 'Key không chính xác hoặc đã hết hạn!' });
    }
}
