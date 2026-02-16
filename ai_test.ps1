$ErrorActionPreference='Stop'
$base='http://localhost:3000'
$session=New-Object Microsoft.PowerShell.Commands.WebRequestSession
function TryInvoke($method,$url,$body=$null,$isJson=$true){
    try{
        if($isJson){
            $args=@{Uri=($base+$url);Method=$method;WebSession=$session;ContentType='application/json';ErrorAction='Stop'}
            if($body){ $args.Body=($body|ConvertTo-Json -Depth 10) }
            $resp=Invoke-WebRequest @args
            $status=$resp.StatusCode
            $content=$resp.Content
            $json=$null
            try{ $json=ConvertFrom-Json $content } catch { $json=$null }
            return @{ok=$true;status=$status;content=$content;json=$json}
        } else {
            $resp=Invoke-WebRequest -Uri ($base+$url) -Method $method -WebSession $session -ErrorAction Stop
            return @{ok=$true;status=$resp.StatusCode;content=$resp.Content}
        }
    } catch {
        $err=$_
        $status=$null
        if($err.Exception -and $err.Exception.Response){
            try{ $status=$err.Exception.Response.StatusCode.Value__ } catch {}
        }
        $body=$null
        try{ $stream = $err.Exception.Response.GetResponseStream(); if($stream){ $sr = New-Object IO.StreamReader($stream); $body = $sr.ReadToEnd() } }
        catch {}
        return @{ok=$false;status=$status;content=$body;error=$err.Exception.Message}
    }
}

Write-Host '== LOGIN =='
$login=TryInvoke 'Post' '/api/auth/login' @{email='test@shotpilot.com';password='testpassword123'}
Write-Host "LOGIN => status=$($login.status) ok=$($login.ok)"
if(-not $login.ok){ Write-Host 'Login failed; aborting tests.'; exit 1 }

Write-Host '== PROJECT =='
$projects=TryInvoke 'Get' '/api/projects'
$projectId=$null; $projectExisted=$false
if($projects.ok -and $projects.json){ if($projects.json.Count -gt 0){ $projectId=$projects.json[0].id; $projectExisted=$true } }
if(-not $projectId){ $pbody=@{title='AI Test Project';frame_size='16:9 Widescreen';style_aesthetic='Film Noir'}; $pc=TryInvoke 'Post' '/api/projects' $pbody; if($pc.ok -and $pc.json){ $projectId=$pc.json.id } }
Write-Host "ProjectId: $projectId (existed: $projectExisted)"
if(-not $projectId){ Write-Host 'No project available; aborting.'; exit 1 }

Write-Host '== SCENE =='
$scenes=TryInvoke 'Get' "/api/projects/$projectId/scenes"
$sceneId=$null
if($scenes.ok -and $scenes.json -and $scenes.json.Count -gt 0){ $sceneId=$scenes.json[0].id }
if(-not $sceneId){ $sbody=@{name='Test Scene';order_index=1;status='planning';location_setting='Dark alley';time_of_day='Night';mood_tone='Tense'}; $sc=TryInvoke 'Post' "/api/projects/$projectId/scenes" $sbody; if($sc.ok -and $sc.json){ $sceneId=$sc.json.id } }
Write-Host "SceneId: $sceneId"
if(-not $sceneId){ Write-Host 'No scene; aborting.'; exit 1 }

Write-Host '== CREATE SHOT =='
$shotBody=@{shot_number='AI-1';shot_type='Medium';camera_angle='Low Angle';camera_movement='Static';description='Detective crouches beside evidence markers in rain-slicked alley, neon signs reflecting off wet pavement';focal_length='35mm';blocking='Subject left-third, evidence markers foreground';camera_lens='Prime 35mm'}
$shot=TryInvoke 'Post' "/api/scenes/$sceneId/shots" $shotBody
$shotId = if($shot.ok -and $shot.json){ $shot.json.id } else { $null }
Write-Host "ShotId: $shotId"

Write-Host '== CREATE CHARACTER =='
$charBody=@{name='Detective Morrow';description='Weathered female detective, late 40s, silver-streaked dark hair pulled back, deep-set eyes, rain-soaked trench coat';personality='World-weary but sharp, sardonic humor masks genuine empathy'}
$char=TryInvoke 'Post' "/api/projects/$projectId/characters" $charBody
$charId = if($char.ok -and $char.json){ $char.json.id } else { $null }
Write-Host "CharId: $charId"

Write-Host '== CREATE OBJECT =='
$objBody=@{name='Evidence Case';description='Battered aluminum evidence case with dented corners, forensic stickers, smudged latex glove prints'}
$obj=TryInvoke 'Post' "/api/projects/$projectId/objects" $objBody
$objId = if($obj.ok -and $obj.json){ $obj.json.id } else { $null }
Write-Host "ObjId: $objId"

$results = @()
function AddResult($n,$endpoint,$status,$shapeOk,$snippet,$notes){
    $obj = [PSCustomObject]@{Number=$n;Endpoint=$endpoint;Status=$status;ShapeOk=$shapeOk;Snippet=$snippet;Notes=$notes}
    if (-not ($script:results)) { $script:results = @() }
    $script:results += $obj
    Write-Host "Added result: #$n $endpoint status=$status shapeOk=$shapeOk"
}
function FirstText($json){ if(-not $json){ return '' } ; $str = ($json | ConvertTo-Json -Depth 8); if($str.Length -gt 100){ return $str.Substring(0,100) } else { return $str } }

Write-Host '== TEST 1: Check Readiness =='
$r1=TryInvoke 'Post' "/api/shots/$shotId/check-readiness" @{useKB=$true}
$shapeOk = ($r1.ok -and $r1.json -and $r1.json.percentage -ne $null -and $r1.json.kbReadiness -ne $null)
AddResult 1 '/api/shots/{shotId}/check-readiness' $r1.status $shapeOk (FirstText $r1.json) ($r1.ok ? 'OK' : $r1.error)

Write-Host '== TEST 2: Get Recommendations =='
$r2=TryInvoke 'Post' "/api/shots/$shotId/get-recommendations" @{missingFields=@('camera_movement','notes')}
$shapeOk = ($r2.ok -and $r2.json -and ($r2.json -is [System.Array]))
AddResult 2 '/api/shots/{shotId}/get-recommendations' $r2.status $shapeOk (FirstText $r2.json) ($r2.ok ? 'OK' : $r2.error)

Write-Host '== TEST 3: Aesthetic Suggestions =='
$r3=TryInvoke 'Post' "/api/projects/$projectId/aesthetic-suggestions" @{}
$shapeOk = ($r3.ok -and $r3.json -and $r3.json.suggestions -ne $null -and $r3.json.kbFilesUsed -ne $null)
AddResult 3 '/api/projects/{projectId}/aesthetic-suggestions' $r3.status $shapeOk (FirstText $r3.json) ($r3.ok ? 'OK' : $r3.error)

Write-Host '== TEST 4: Character Suggestions =='
$r4=TryInvoke 'Post' "/api/projects/$projectId/character-suggestions" @{name='Detective Morrow';description='Weathered female detective, late 40s';personality='World-weary but sharp'}
$shapeOk = ($r4.ok -and $r4.json -and $r4.json.description -and $r4.json.reference_prompt -and $r4.json.consistency_tips)
AddResult 4 '/api/projects/{projectId}/character-suggestions' $r4.status $shapeOk (FirstText $r4.json) ($r4.ok ? 'OK' : $r4.error)

Write-Host '== TEST 5: Object Suggestions =='
$r5=TryInvoke 'Post' "/api/projects/$projectId/object-suggestions" @{name='Evidence Case';description='Battered aluminum evidence case';targetModel='midjourney-v7'}
$shapeOk = ($r5.ok -and $r5.json -and $r5.json.description -and $r5.json.reference_prompt -and $r5.json.turnaround_prompts)
AddResult 5 '/api/projects/{projectId}/object-suggestions' $r5.status $shapeOk (FirstText $r5.json) ($r5.ok ? 'OK' : $r5.error)

Write-Host '== TEST 6: Shot Plan =='
$r6=TryInvoke 'Post' "/api/scenes/$sceneId/shot-plan" @{}
$shapeOk = ($r6.ok -and $r6.json -and $r6.json.suggested_shots -ne $null)
AddResult 6 '/api/scenes/{sceneId}/shot-plan' $r6.status $shapeOk (FirstText $r6.json) ($r6.ok ? 'OK' : $r6.error)

Write-Host '== TEST 7: Generate Prompt =='
$r7=TryInvoke 'Post' "/api/shots/$shotId/generate-prompt" @{modelName='midjourney-v7'}
$variantId = if($r7.ok -and $r7.json -and $r7.json.variant -and $r7.json.variant.id){ $r7.json.variant.id } else { $null }
$shapeOk = ($r7.ok -and $r7.json -and $r7.json.generated_prompt -and $r7.json.readiness_tier)
AddResult 7 '/api/shots/{shotId}/generate-prompt' $r7.status $shapeOk (FirstText $r7.json) ($r7.ok ? ('variantId:'+($variantId)) : $r7.error)

Write-Host '== TEST 8: Readiness Dialogue =='
$r8=TryInvoke 'Post' "/api/shots/$shotId/readiness-dialogue" @{message='What would make this shot more cinematic?';history=@()}
$shapeOk = ($r8.ok -and $r8.json -and $r8.json.reply)
AddResult 8 '/api/shots/{shotId}/readiness-dialogue' $r8.status $shapeOk (FirstText $r8.json) ($r8.ok ? 'OK' : $r8.error)

Write-Host '== TEST 9: Script Analysis =='
$scriptText = @'
INT. DARK ALLEY - NIGHT

Rain hammers the cracked asphalt. DETECTIVE MORROW (40s, silver-streaked hair) crouches beside a chalk outline, evidence markers scattered like fallen stars.

MORROW
(into radio)
Get forensics down here. And tell them to bring the UV kit.

She stands, her trench coat heavy with rain, and stares at the neon sign flickering above: PARADISE MOTEL.
'@
$r9=TryInvoke 'Post' "/api/projects/$projectId/analyze-script" @{scriptText=$scriptText}
$shapeOk = ($r9.ok -and $r9.json -and $r9.json.scenes -and $r9.json.characters -and $r9.json.visual_notes)
AddResult 9 '/api/projects/{projectId}/analyze-script' $r9.status $shapeOk (FirstText $r9.json) ($r9.ok ? 'OK' : $r9.error)

Write-Host '== TEST 10: Creative Director =='
$r10=TryInvoke 'Post' "/api/projects/$projectId/creative-director" @{message='I want this project to feel like a 1990s David Fincher thriller — green-tinted shadows, always raining, claustrophobic framing. What visual approach should we take?';history=@();mode='vision'}
$shapeOk = ($r10.ok -and $r10.json -and $r10.json.reply)
AddResult 10 '/api/projects/{projectId}/creative-director' $r10.status $shapeOk (FirstText $r10.json) ($r10.ok ? 'OK' : $r10.error)

Write-Host '== TEST 11: Content Refinement (Character) =='
$r11=TryInvoke 'Post' "/api/projects/$projectId/refine-content" @{type='character';currentContent=@{name='Detective Morrow';description='Weathered female detective'};message='Make her look more battle-hardened, add scars and a prosthetic left hand';history=@()}
$shapeOk = ($r11.ok -and $r11.json -and $r11.json.updatedContent)
AddResult 11 '/api/projects/{projectId}/refine-content' $r11.status $shapeOk (FirstText $r11.json) ($r11.ok ? 'OK' : $r11.error)

Write-Host '== TEST 12: Conversation Compaction =='
$msgs = @(
 @{role='user';content='I want a noir project'}, @{role='assistant';content='Great choice...'}, @{role='user';content='Main character is a detective'}, @{role='assistant';content='I will create...'}, @{role='user';content='She should be in her 40s'}, @{role='assistant';content='Updated...'}, @{role='user';content='Add a dark alley scene'}, @{role='assistant';content='Scene created...'}, @{role='user';content='The mood should be tense'}, @{role='assistant';content='I have updated...'}, @{role='user';content='What about the lighting?'}, @{role='assistant';content='For noir...'} )
$r12=TryInvoke 'Post' "/api/projects/$projectId/compact-conversation" @{messages=$msgs}
$shapeOk = ($r12.ok -and $r12.json -and $r12.json.summary -and $r12.json.compactedMessages)
AddResult 12 '/api/projects/{projectId}/compact-conversation' $r12.status $shapeOk (FirstText $r12.json) ($r12.ok ? 'OK' : $r12.error)

Write-Host '== TEST 13: Holistic Image Audit (conditional) =='
$didUpload = $false; $auditOk = $false
if($variantId){
    $uploads = Get-ChildItem -Path 'shotpilot-app/uploads/images' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if($uploads){
        $img=$uploads.FullName; Write-Host "Uploading image $img to variant $variantId"
        try{ $form = @{ image = Get-Item $img }; $up = Invoke-WebRequest -Uri ($base+"/api/variants/$variantId/upload-image") -Method Post -Form $form -WebSession $session -ErrorAction Stop; $didUpload=$true } catch { Write-Host 'Upload failed:' $_.Exception.Message }
        if($didUpload){ $a=TryInvoke 'Post' "/api/variants/$variantId/audit" @{}; $auditOk = ($a.ok -and $a.json -and $a.json.overall_score); AddResult 13 '/api/variants/{variantId}/audit' $a.status $auditOk (FirstText $a.json) ($a.ok ? 'OK' : $a.error) }
        else { AddResult 13 '/api/variants/{variantId}/audit' 0 $false '' 'No upload performed or upload failed' }
    } else { AddResult 13 '/api/variants/{variantId}/audit' 0 $false '' 'No local uploads found to test' }
} else { AddResult 13 '/api/variants/{variantId}/audit' 0 $false '' 'No variantId from generate-prompt; skipped' }

Write-Host '== TEST 14: Prompt Refinement =='
if($auditOk -and $variantId){ $r14=TryInvoke 'Post' "/api/variants/$variantId/refine-prompt" @{}; $shapeOk = ($r14.ok -and $r14.json.refined_prompt); AddResult 14 '/api/variants/{variantId}/refine-prompt' $r14.status $shapeOk (FirstText $r14.json) ($r14.ok ? 'OK' : $r14.error) } else { AddResult 14 '/api/variants/{variantId}/refine-prompt' 0 $false '' 'Skipped (no audit data)' }

Write-Host '== CLEANUP (best-effort) =='
function TryDelete($paths){ foreach($p in $paths){ try{ $d=Invoke-WebRequest -Uri ($base+$p) -Method Delete -WebSession $session -ErrorAction Stop; Write-Host "Deleted $p =>" $d.StatusCode } catch { Write-Host "Delete $p failed:" $_.Exception.Message } } }
$delPaths = @()
if($shotId){ $delPaths += "/api/shots/$shotId" }
if($charId){ $delPaths += "/api/characters/$charId"; $delPaths += "/api/projects/$projectId/characters/$charId" }
if($objId){ $delPaths += "/api/projects/$projectId/objects/$objId"; $delPaths += "/api/objects/$objId" }
if($sceneId){ $delPaths += "/api/scenes/$sceneId"; $delPaths += "/api/projects/$projectId/scenes/$sceneId" }
TryDelete $delPaths

Write-Host "`nResults count: $($results.Count)"
Write-Host "`n| # | Endpoint | Status | Response Shape OK? | Notes |"
Write-Host "|---|---|---:|---:|---|"
foreach($r in $results){
    $notes = $r.Notes -replace '\r?\n',' '
    $snippet = $r.Snippet -replace '\r?\n',' '
    Write-Host "| $($r.Number) | $($r.Endpoint) | $($r.Status) | $($r.ShapeOk) | $snippet $notes |"
}
