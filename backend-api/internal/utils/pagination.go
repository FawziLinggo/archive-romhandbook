package utils

func GetOffset(

	page int,
	limit int,

) int {

	return (page - 1) * limit
}

func NormalizePagination(
	page int,
	limit int,
) (
	int,
	int,
) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 || limit > 24 {
		limit = 24
	}

	return page, limit
}
