@echo off

echo =====================
echo TEST SKILLS
echo =====================

curl http://127.0.0.1:8080/api/v1/skills

echo.
echo.
echo =====================
echo TEST PAGINATION
echo =====================

curl "http://127.0.0.1:8080/api/v1/skills?page=1&limit=5"

echo.
echo.
echo =====================
echo TEST SEARCH
echo =====================

curl "http://127.0.0.1:8080/api/v1/skills?page=1&limit=5&query=fire"

echo.
echo.


echo.
echo.
echo =====================
echo TEST GET SKILL SLUG
echo =====================
curl "http://127.0.0.1:8080/api/v1/skills/dragon-king-shield-1827008"
echo.
echo.