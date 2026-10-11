export default function handler(req, res) {
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

    // Tính toán Key theo ngày giờ Việt Nam (UTC+7)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = new Date(utc + (3600000 * 7));

    const day = vnTime.getDate();
    const month = vnTime.getMonth() + 1;
    const year = vnTime.getFullYear();

    const validKey = String((day + 18) * month * year - 2011 * 8);

    if (String(key).trim() === String(validKey)) {
        // TOÀN BỘ CODE TÍNH NĂNG CHÍNH ĐƯỢC GIẤU AN TOÀN TẠI ĐÂY
        const protectedScript = `
            local g = game
            local P = g:GetService("Players")
            local lp = P.LocalPlayer
            local hs = g:GetService("HttpService")
            local ts = g:GetService("TeleportService")
            local cg = g:GetService("CoreGui")

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
