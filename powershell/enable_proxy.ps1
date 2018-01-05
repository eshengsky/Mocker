$regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
$proxyServer = "http=127.0.0.1:2018;https=127.0.0.1:2018;"
Set-ItemProperty -path $regKey ProxyServer -value $proxyServer
Set-ItemProperty -path $regKey ProxyOverride -value ""
Set-ItemProperty -path $regKey ProxyEnable -value 1
$wininet = Add-Type -memberDefinition @"
[DllImport("wininet.dll")]
public static extern bool InternetSetOption(int hInternet, int dwOption, int lpBuffer, int dwBufferLength);  
"@ -passthru -name myInternetSetOption
$wininet::InternetSetOption([IntPtr]::Zero, 95, [IntPtr]::Zero, 0) #INTERNET_OPTION_PROXY_SETTINGS_CHANGED
$wininet::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0) #INTERNET_OPTION_REFRESH