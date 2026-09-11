import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { castVote, createPoll, subscribePolls } from '../services/polls'
import { Loader, EmptyState, ErrorState } from '../components/StateViews'

export default function Polls() {
  const { profile } = useAuth()
  const [polls, setPolls] = useState([])
  const [status, setStatus] = useState('loading')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [creating, setCreating] = useState(false)
  const [voteError, setVoteError] = useState('')

  useEffect(() => {
    const unsub = subscribePolls(
      (data) => {
        setPolls(data)
        setStatus('ready')
      },
      () => setStatus('error')
    )
    return unsub
  }, [])

  function updateOption(index, value) {
    setOptions((opts) => opts.map((o, i) => (i === index ? value : o)))
  }

  function addOptionField() {
    if (options.length < 6) setOptions((opts) => [...opts, ''])
  }

  function removeOptionField(index) {
    if (options.length > 2) setOptions((opts) => opts.filter((_, i) => i !== index))
  }

  async function handleCreate(e) {
    e.preventDefault()
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim() || cleanOptions.length < 2) return
    setCreating(true)
    try {
      await createPoll({ question: question.trim(), options: cleanOptions, createdBy: profile?.name })
      setQuestion('')
      setOptions(['', ''])
    } finally {
      setCreating(false)
    }
  }

  async function handleVote(pollId, optionId) {
    setVoteError('')
    try {
      await castVote(pollId, optionId, profile?.flatNumber)
    } catch (err) {
      setVoteError(err.message === 'ALREADY_VOTED' ? 'You have already voted in this poll.' : 'Could not cast vote.')
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="page">
      <h1>Polls & Surveys</h1>

      {isAdmin && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input
            placeholder="Poll question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {options.map((opt, i) => (
            <div key={i} className="poll-option-row">
              <input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              {options.length > 2 && (
                <button type="button" className="icon-btn" onClick={() => removeOptionField(i)}>✕</button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button type="button" className="add-option-btn" onClick={addOptionField}>+ Add option</button>
          )}
          <button disabled={creating}>{creating ? 'Creating…' : 'Create poll'}</button>
        </form>
      )}

      {voteError && <p className="form-error">{voteError}</p>}

      {status === 'loading' && <Loader label="Loading polls…" />}
      {status === 'error' && <ErrorState message="Couldn't load polls." />}
      {status === 'ready' && polls.length === 0 && (
        <EmptyState title="No polls yet" hint="Committee polls and surveys will appear here." />
      )}

      <ul className="card-list">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0)
          const hasVoted = poll.voterFlats?.includes(profile?.flatNumber)

          return (
            <li key={poll.id} className="card">
              <h3>{poll.question}</h3>
              <div className="poll-options">
                {poll.options.map((opt) => {
                  const pct = totalVotes ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0
                  return hasVoted || isAdmin ? (
                    <div key={opt.id} className="poll-result">
                      <div className="poll-result-label">
                        <span>{opt.text}</span>
                        <span>{pct}% ({opt.votes || 0})</span>
                      </div>
                      <div className="poll-bar-bg">
                        <div className="poll-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ) : (
                    <button key={opt.id} className="poll-vote-btn" onClick={() => handleVote(poll.id, opt.id)}>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
              <span className="card-meta">
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''} · by {poll.createdBy}
                {hasVoted && !isAdmin && ' · You voted'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}