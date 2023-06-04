const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions')
const author = require('./models/author')
const pubsub = new PubSub()

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            // filter by author and book genres
            if (args.author && args.genre) {
                return await Book.find({ author: await Author.findOne({ name: args.author }), genres: { $in: [args.genre] } })
            }
            // filter by author
            else if (args.author) {
                return await Book.find({ author: await Author.findOne({ name: args.author }) })
            }
            // filter by book genres
            else if (args.genre) {
                return await Book.find({ genres: { $in: [args.genre] } })
            }
            return await Book.find({})
        },
        // display logged in user info
        me: (root, args, context) => {
            return context.currentUser
        },
        allAuthors: async () => {
            return await Author.find({}).populate('bookCount')
        }
    },
    Book: {
        author: async (root) => {
            return await Author.findOne({ _id: root.author })
        }
    },
    Author: {
        // display total book of the author
        bookCount: async (root) => {
            return await Book.countDocuments({ author: root._id })
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError('Not authenticated', {
                    extensions: {
                        code: 'NOT_AUTHENTICATED'
                    }
                })
            }

            // check if author is in database
            let author = await Author.findOne({ name: args.author })

            // Save the author if not in database
            if (!author) {
                const newAuthor = new Author({ name: args.author })
                try {
                    await newAuthor.save()
                } catch (error) {
                    throw new GraphQLError('Saving author failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.name,
                            error
                        }
                    })
                }
                author = newAuthor
            }

            // create new book
            const book = new Book({ ...args, author })

            try {
                await book.save()
            } catch (error) {
                throw new GraphQLError('Saving book failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.title,
                        error
                    }
                })
            }

            pubsub.publish('BOOK_ADDED', { bookAdded: book })

            return book
        },
        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new GraphQLError('Not authenticated', {
                    extensions: {
                        code: 'NOT_AUTHENTICATED'
                    }
                })
            }

            // check if the author is in database
            const author = await Author.findOne({ name: args.name })

            // change birth
            author.born = args.setBornTo

            try {
                await author.save()
            } catch (error) {
                throw new GraphQLError('Edit author failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        error
                    }
                })
            }

            return author
        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

            return user.save()
                .catch(error => {
                    throw new GraphQLError('Saving user failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.username,
                            error
                        }
                    })

                })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password != 'secret') {
                throw new GraphQLError('Wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id
            }

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        }
    }
}

module.exports = resolvers