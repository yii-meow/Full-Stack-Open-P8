import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    published
    author{
      name
      born
      bookCount
    }
    genres
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors{
        name
        born
        bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query{
    allBooks{
        title
        author{
          name
          born
          bookCount
        }
        published
        genres
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!){
    addBook(
        title: $title
        author: $author
        published: $published
        genres: $genres
    ){
        id
        title
        published
        author{
          name
          born
          bookCount
        }
        genres
    }
  }
`

export const EDIT_BIRTHYEAR = gql`
  mutation editBirthyear($name: String!, $setBornTo: Int!){
    editAuthor(
        name: $name
        setBornTo: $setBornTo
    ){
        name
        born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!){
    login(
        username: $username
        password: $password
    ){
        value
    }
  
  }
`

export const FAVORITE_GENRE = gql`
  query{
    me{
      favoriteGenre
    }
  }
`

export const FILTER_GENRE = gql`
  query filterGenre($genre: String!){
    allBooks(genre: $genre){
      title
      author{
        name
      }
      published
      genres
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded{
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`