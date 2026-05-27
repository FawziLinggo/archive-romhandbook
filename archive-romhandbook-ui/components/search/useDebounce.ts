import {
    useEffect,
    useState
} from "react"

export default function useDebounce<T>(

    value: T,
    delay: number = 300

) {

    const [

        debounced,
        setDebounced

    ] = useState(value)

    useEffect(() => {

        const timeout =
            setTimeout(() => {

                setDebounced(value)

            }, delay)

        return () =>

            clearTimeout(timeout)

    }, [

        value,
        delay

    ])

    return debounced

}