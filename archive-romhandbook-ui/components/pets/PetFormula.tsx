"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"

import {
    oneDark
} from "react-syntax-highlighter/dist/esm/styles/prism"

type Props = {

    formula: string
}

export default function PetFormula({

    formula

}: Props) {

    if (!formula) {

        return null

    }

    return (

        <div>

            <h2
                className="
                    mb-4
                    text-2xl
                    font-black
                    text-white
                "
            >
                Formula
            </h2>

            <div
                className="
                    overflow-hidden
                    rounded-3xl

                    border
                    border-white/10
                "
            >

                <SyntaxHighlighter
                    language="json"
                    style={oneDark}
                    customStyle={{

                        margin: 0,

                        padding: "2rem",

                        background:
                            "rgba(15,15,20,0.95)",

                        fontSize:
                            "0.9rem",

                        borderRadius:
                            "1.5rem"
                    }}
                    wrapLongLines
                >
                    {formula}
                </SyntaxHighlighter>

            </div>

        </div>

    )

}