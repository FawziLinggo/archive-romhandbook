@echo off

@REM echo =====================
@REM echo TEST SKILLS
@REM echo =====================

@REM curl http://127.0.0.1:8080/api/v1/skills

@REM echo.
@REM echo.
@REM echo =====================
@REM echo TEST PAGINATION
@REM echo =====================

@REM @REM curl "http://127.0.0.1:8080/api/v1/skills?page=1&limit=5"

@REM echo.
@REM echo.
@REM echo =====================
@REM echo TEST SEARCH
@REM echo =====================

@REM @REM curl "http://127.0.0.1:8080/api/v1/skills?page=1&limit=5&query=fire"

@REM echo.
@REM echo.


@REM echo.
@REM echo.
@REM echo =====================
@REM echo TEST GET SKILL SLUG
@REM echo =====================
@REM @REM curl "http://127.0.0.1:8080/api/v1/skills/dragon-king-shield-1827008"
@REM echo.
@REM echo.



@REM echo =====================
@REM echo TEST GET PETS
@REM echo =====================
@REM curl "http://127.0.0.1:8080/api/v1/pets?page=1&limit=24"

@REM echo.
@REM echo.


@REM echo =====================
@REM echo TEST GET PETS WITH QUERY
@REM echo =====================
@REM curl "http://127.0.0.1:8080/api/v1/pets/search?query=lunatic"

@REM echo.
@REM echo.

@REM echo =====================
@REM echo TEST GET PETS WITH SLUG
@REM echo =====================
@REM curl "http://127.0.0.1:8080/api/v1/pets/angry-dreamer-zephyr"

@REM echo.
@REM echo.


echo =====================
echo TEST GET PET EGG BY ID
echo =====================
curl "http://127.0.0.1:8080/api/v1/things/900297" | jq
