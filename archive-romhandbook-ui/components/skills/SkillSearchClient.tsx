"use client"

import {
    useEffect,
    useState
} from "react"

import type {
    Skill
} from "@/lib/queries/skills"

import Pagination from "../common/Pagination"

import SkillGrid from "./SkillGrid"

import SearchInput from "../search/SearchInput"
import SearchStatus from "../search/SearchStatus"

import useDebounce from "../search/useDebounce"

type Props = {

    initialSkills: Skill[]

    page: number

    hasNext: boolean

}

export default function SkillSearchClient({

    initialSkills,
    page,
    hasNext

}: Props) {

    // =====================
    // STATE
    // =====================

    const [

        query,
        setQuery

    ] = useState("")

    const [

        loading,
        setLoading

    ] = useState(false)

    const [

        skills,
        setSkills

    ] = useState(initialSkills)

    // =====================
    // DEBOUNCE
    // =====================

    const debouncedQuery =
        useDebounce(query, 300)

    // =====================
    // SEARCH
    // =====================

    useEffect(() => {

        // RESET
        if (debouncedQuery.length < 4) {

            setSkills(initialSkills)

            return

        }

        setLoading(true)

        async function fetchSkills() {

            try {

                const res =
                    await fetch(

                        `/api/skills/search?query=${encodeURIComponent(debouncedQuery)}`

                    )

                const data =
                    await res.json()

                setSkills(data)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)

            }

        }

        fetchSkills()

    }, [

        debouncedQuery,
        initialSkills

    ])

    return (

        <div
            className="
                space-y-8
            "
        >

            {/* SEARCH */}

            <div
                className="
                    space-y-3
                "
            >

                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search skills..."
                />

                <SearchStatus
                    query={query}
                    loading={loading}
                    count={skills.length}
                />

            </div>

            {/* GRID */}

            <SkillGrid
                skills={skills}
            />

            {/* PAGINATION */}

            {query.length < 4 && (

                <Pagination
                    page={page}
                    hasNext={hasNext}
                    query=""
                    basePath="/skills"
                />

            )}

        </div>

    )

}