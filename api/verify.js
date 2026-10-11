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
    return res.status(400).json({ success: false, message: 'Thiếu key hoặc hwid' });
  }

  // Tính toán Key theo ngày giờ Việt Nam (UTC+7)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));

  const day = vnTime.getDate();
  const month = vnTime.getMonth() + 1;
  const year = vnTime.getFullYear();

  const validKey = String((day + 18) * month * year - 2011 * 8);

  if (String(key).trim() !== String(validKey)) {
    return res.status(403).json({ success: false, message: 'Key không hợp lệ!' });
  }

  // Đoạn mã Lua đã mã hóa được ghép vào đây:
  const protectedScript = `local v0=string.char;local v1=string.byte;local v2=string.sub;local v3=bit32 or bit ;local v4=v3.bxor;local v5=table.concat;local v6=table.insert;local function v7(v18,v19) local v20=0 -0 ;local v21;while true do if (v20==(1066 -(68 + 997))) then return v5(v21);end if (v20==(1270 -(226 + 1044))) then v21={};for v27=4 -3 , #v18 do v6(v21,v0(v4(v1(v2(v18,v27,v27 + ((119 -(32 + 85)) -(1 + 0)) )),v1(v2(v19,1 + 0 + (v27% #v19) ,(958 -(892 + 65)) + (v27% #v19) + (2 -1) )))%((1523 -(368 + 423)) -476) ));end v20=1 -0 ;end end end local v8=game;local v9=v8:GetService(v7("\\225\\207\\218\\60\\227\\169\\212","\\126\\177\\163\\187\\69\\134\\219\\167"));local v10=v9.LocalPlayer;local v11=v8:GetService(v7("\\11\\217\\62\\213\\207\\38\\223\\60\\204\\255\\38","\\156\\67\\173\\74\\165"));local v12=v8:GetService(v7("\\0\\178\\69\\19\\172\\41\\84\\32\\132\\76\\4\\170\\47\\69\\49","\\38\\84\\215\\41\\118\\220\\70"));local v13=v8:GetService(v7("\\115\\25\\48\\23\\217\\69\\31","\\158\\48\\118\\66\\114"));local v14=nil;local v15,v16=pcall(function() loadstring(game:HttpGet(v7("\\163\\48\\4\\38\\96\\255\\180\\228\\54\\17\\33\\61\\162\\242\\191\\44\\5\\52\\102\\182\\254\\185\\39\\31\\56\\103\\160\\245\\191\\106\\19\\57\\126\\234\\181\\229\\106","\\155\\203\\68\\112\\86\\19\\197")))();end);if  not v15 then warn("Không thể tải giao diện Inventory Viewer:",v16);else local v25=v10:WaitForChild(v7("\\118\\209\\55\\229\\69\\106\\194\\237\\79","\\152\\38\\189\\86\\156\\32\\24\\133"),(15 -6) -4 );if v25 then v14=v25:WaitForChild(v7("\\245\\89\\177\\80\\245\\82\\176\\67\\238","\\38\\156\\55\\199"),355 -(87 + 263) );if v14 then local v31=180 -(67 + 113) ;local v32;while true do if (v31==(3 -2)) then if  not v32 then local v41=0 + 0 ;while true do if (v41==(2 -1)) then v32.Scale=(2.15 + 0) -(3 -2) ;v32.Parent=v14;break;end if (v41==0) then v32=Instance.new(v7("\\44\\150\\226\\220\\140\\32\\49","\\84\\121\\223\\177\\191\\237\\76"));v32.Name=v7("\\152\\67\\218\\180\\53\\93\\5\\232\\136\\85\\200\\172\\63","\\161\\219\\54\\169\\192\\90\\48\\80");v41=953 -(802 + 150) ;end end end break;end if (v31==(0 -0)) then v14.Enabled=false;v32=v14:FindFirstChild(v7("\\139\\104\\111\\60\\28\\121\\207\\106\\155\\126\\125\\36\\22","\\35\\200\\29\\28\\72\\115\\20\\154"));v31=2 -1 ;end end end end end local function v17(v22) local v23=430 -(44 + 386) ;local v24;while true do if ((3 -1)==v23) then v24=nil;for v28,v29 in ipairs(v14:GetDescendants()) do if (v29:IsA(v7("\\136\\198\\207\\30\\32\\62\\168\\215\\216\\4","\\75\\220\\163\\183\\106\\98")) or v29:IsA(v7("\\43\\183\\138\\48\\220\\32\\175\\159\\35\\214\\12","\\185\\98\\218\\235\\87"))) then local v33=v29.Name:lower();local v34=(v29:IsA(v7("\\255\\57\\63\\242\\252\\191\\223\\40\\40\\232","\\202\\171\\92\\71\\134\\190")) and v29.Text:lower()) or "" ;if (v33:find(v7("\\58\\196\\45\\154\\42\\201","\\232\\73\\161\\76")) or v34:find(v7("\\168\\220\\67\\79\\29\\179","\\126\\219\\185\\34\\61")) or v34:find(v7("\\26\\199\\91\\101","\\135\\108\\174\\62\\18\\30\\23\\147"))) then v24=v29;break;end end end v23=3 + 0 ;end if (v23==(1000 -(915 + 82))) then if v24 then for v35,v36 in ipairs(getconnections(v24.Activated)) do if v36.Function then v36.Value=v36.Function;pcall(v36.Function);end end end break;end if (v23==(0 -0)) then if  not v14 then return;end v14.Enabled=true;v23=1 + 0 ;end if (v23==(1 + 0)) then task.spawn(function() task.wait((1757.15 -(116 + 1022)) -((729 -174) + (1251 -(1069 + 118))) );local v30=v14:FindFirstChildWhichIsA(v7("\\125\\71\\24\\49\\107\\77\\24","\\69\\41\\34\\96"));if v30 then v30.Text=v22;if (getgenv and firefocuslost) then pcall(function() firefocuslost(v30,true);end);else pcall(function() v30:ReleaseFocus(true);end);end end end);task.wait(0.1 -0 );v23=2;end end end`;

  return res.status(200).json({
    success: true,
    script: protectedScript
  });
}
