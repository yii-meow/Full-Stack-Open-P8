import { FILTER_GENRE } from "../queries"
import { useQuery } from "@apollo/client"
import { useState, useEffect } from "react"

const Books = ({ show, books }) => {
  const [chosenGenre, setChosenGenre] = useState("")
  const [allGenres, setAllGenres] = useState(null)

  useEffect(() => {
    const allGenre = books.map(b => b.genres).flat()
    const distinctGenres = [...new Set(allGenre)]
    setAllGenres(distinctGenres)
  }, [books])

  const filteredBooks = useQuery(FILTER_GENRE, {
    variables: { genre: chosenGenre }
  })

  if (books.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {
            (
              (chosenGenre === "" ? books : filteredBooks.data?.allBooks) || []).map((b) => (
                <tr key={b.title}>
                  <td>{b.title}</td>
                  <td>{b.author.name}</td>
                  <td>{b.published}</td>
                </tr>
              )
              )
          }

        </tbody>
      </table>
      {/* Show Genres filter option */}
      {
        allGenres.map((g) => (
          <button key={g} onClick={() => setChosenGenre(g)}>{g}</button>
        ))
      }
      <button onClick={() => setChosenGenre("")}>all genres</button>

    </div>
  )
}

export default Books
