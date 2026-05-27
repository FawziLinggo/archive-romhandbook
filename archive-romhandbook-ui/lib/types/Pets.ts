export type Pet = {

    id: string

    detail_url: string

    image: string

    name: string

    race: string | null

    element: string | null

    size: string | null

    description: string | null

    unlock_text: string | null

    egg_id: string | null

    egg_url: string | null

    egg_name: string | null

    egg_image: string | null

    skills: string
}

export type PetDetail = {

    id: string

    detail_url: string

    image: string

    name: string

    race: string | null

    element: string | null

    size: string | null

    description: string | null

    unlock_text: string | null

    skills: string

    formulas_raw: string | null

    raw_html: string | null

    egg_name: string | null

    egg_image: string | null

    egg_url: string | null
}



export type PetEgg = {

    id: string

    detail_url: string

    image: string

    name: string

    description: string | null

    effect_text: string | null

    unlock_text: string | null

    jobs_raw: string | null

    pet_url: string | null

    pet_name: string | null

    pet_image: string | null

    formulas_raw: string | null

    raw_html: string | null
}
