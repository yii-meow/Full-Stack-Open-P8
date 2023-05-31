import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, EDIT_BIRTHYEAR } from "../queries"
import { useState } from 'react'
import Select from 'react-select'

const BirthyearForm = ({ authors }) => {
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const options = authors.map(a => {
    return {
      value: a.name,
      label: a.name
    }
  });

  const [selectedOption, setSelectedOption] = useState(null)

  const submit = (e) => {
    e.preventDefault()

    editAuthor({
      variables: {
        name: selectedOption.value,
        setBornTo: parseInt(born)
      }
    })

    setSelectedOption(null)
    setBorn('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        name:
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options} />
        born
        <input value={born} onChange={({ target }) => setBorn(target.value)} /> <br />

        <button type="submit">update author</button>
      </form>
    </div>
  )
}

const Authors = (props) => {
  const authors = useQuery(ALL_AUTHORS)

  if (authors.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <BirthyearForm authors={authors.data.allAuthors} />
    </div>
  )
}

export default Authors
