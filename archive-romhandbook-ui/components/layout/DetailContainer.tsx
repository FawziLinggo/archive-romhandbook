type Props = {

    children: React.ReactNode

}

export default function DetailContainer({
    children
}: Props) {

    return (

        <div
            className="
                mx-auto
                max-w-7xl

                px-6
                py-10
            "
        >

            {children}

        </div>

    )

}