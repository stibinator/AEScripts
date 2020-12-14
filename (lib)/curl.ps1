$url = "http://mirror.internode.on.net/pub/test/10meg.test"
$output = "$Home\test.test"
$start_time = Get-Date

Invoke-WebRequest -Uri $url -OutFile $output
Write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)"