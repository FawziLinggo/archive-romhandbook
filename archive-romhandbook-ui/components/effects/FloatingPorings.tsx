import Image from "next/image"

const porings = [

    {
        src: "/assets/porings/poring.png",
        size: 90,
        left: "8%",
        top: "12%",
        delay: "0s",
        duration: "7s"
    },

    {
        src: "/assets/porings/poporing.png",
        size: 70,
        left: "82%",
        top: "20%",
        delay: "1s",
        duration: "9s"
    },

    {
        src: "/assets/porings/marin.png",
        size: 60,
        left: "12%",
        top: "72%",
        delay: "2s",
        duration: "8s"
    },

    {
        src: "/assets/porings/drops.png",
        size: 80,
        left: "75%",
        top: "78%",
        delay: "0.5s",
        duration: "10s"
    }

]

export default function FloatingPorings() {

    return (

        <div
            className="
                pointer-events-none

                absolute
                inset-0

                overflow-hidden
            "
        >

            {porings.map(
                (
                    poring,
                    index
                ) => (

                    <div
                        key={index}
                        className="
                            absolute

                            animate-[float_ease-in-out_infinite]
                        "
                        style={{

                            left:
                                poring.left,

                            top:
                                poring.top,

                            width:
                                poring.size,

                            height:
                                poring.size,

                            animationDelay:
                                poring.delay,

                            animationDuration:
                                poring.duration
                        }}
                    >

                        <Image
                            src={poring.src}
                            alt="Poring"
                            fill
                            loading="eager"
                            sizes={`${poring.size}px`}
                            className="
                                object-contain

                                opacity-20

                                drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]
                            "
                        />

                    </div>

                )
            )}

        </div>

    )

}