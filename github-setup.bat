@echo off
chcp 65001 >nul
title Kelimelik - GitHub Yukleme Sihirbazi
echo ========================================================
echo       Kelimelik - GitHub Repository Kurulum Sihirbazi
echo ========================================================
echo.
echo Proje yerel olarak Git ile hazirlandi ve commit edildi.
echo.
echo Secenekler:
echo  [1] GitHub CLI (gh) ile sifirdan otomatik repo ac ve yukle
echo  [2] Tarayicida actiginiz bos reponun URL'si ile yukle
echo.
set /p SECIM="Seciminizi yapin (1 veya 2): "

if "%SECIM%"=="1" (
    echo.
    echo GitHub CLI girisi kontrol ediliyor...
    gh auth login
    echo.
    echo Depo olusturuluyor ve kodlar yukleniyor...
    gh repo create kelimelik --public --source=. --remote=origin --push
    echo.
    echo [BASARILI] Projeniz GitHub'a yuklendi!
    pause
    exit /b
)

if "%SECIM%"=="2" (
    echo.
    set /p REPO_URL="GitHub Repo URL'sini yapistirin (Orn: https://github.com/kullanici/kelimelik.git): "
    if "%REPO_URL%"=="" (
        echo Hata: URL bos birakilamaz!
        pause
        exit /b
    )
    git remote remove origin >nul 2>&1
    git remote add origin %REPO_URL%
    git branch -M main
    echo.
    echo Kodlar GitHub'a gonderiliyor...
    git push -u origin main
    echo.
    echo [BASARILI] Kodlar basariyla GitHub'a gonderildi!
    pause
    exit /b
)

echo Gecersiz secim!
pause
