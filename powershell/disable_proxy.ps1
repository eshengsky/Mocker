$regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
Set-ItemProperty -path $regKey ProxyEnable -value 0
Set-ItemProperty -path $regKey ProxyServer -value ""
$wininet = Add-Type -memberDefinition @"
[DllImport("wininet.dll")]
public static extern bool InternetSetOption(int hInternet, int dwOption, int lpBuffer, int dwBufferLength);  
"@ -passthru -name myInternetSetOption
$wininet::InternetSetOption([IntPtr]::Zero, 95, [IntPtr]::Zero, 0) #INTERNET_OPTION_PROXY_SETTINGS_CHANGED
$wininet::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0) #INTERNET_OPTION_REFRESH