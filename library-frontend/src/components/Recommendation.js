import { useQuery } from "@apollo/client"
import { FAVORITE_GENRE, ALL_BOOKS } from "../queries"

export const Recommendations = (props) => {
    const user = useQuery(FAVORITE_GENRE)
    const books = useQuery(ALL_BOOKS)

    if (!props.show) {
        return null
    }

    const favoriteGenre = user.data.me.favoriteGenre
    const favoriteGenreBooks = books.data.allBooks.filter(book => book.genres.includes(favoriteGenre))

    return (
        <div>
            <h2>recommendations</h2>
            <p>books in your favorite genre <b>{favoriteGenre}</b></p>
            <table>
                <tr>
                    <th></th>
                    <th>author</th>
                    <th>published</th>
                </tr>
                {favoriteGenreBooks.map(f =>
                    <tr key={f}>
                        <td>
                            {f.title}
                        </td>
                        <td>
                            {f.author.name}
                        </td>
                        <td>
                            {f.published}
                        </td>
                    </tr>)}
            </table>

        </div>
    )
}