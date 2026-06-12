import { useRef, useState } from 'react'
import './index.css'

const FD_SDK_URL = 'https://fd-web-nine.vercel.app'

const API_CONFIG = {
	apiBaseUrl: 'https://api.finspring.ai/dev/finspring/api/v1/',
	apiKey: 'f58f4aa316cd7462d679910eba52a3b4',
	encryptionKey: '60913a3b628a29ac9fdd2147e69d013135ce8be5b26d2ee5ec5e905838fcfa78',
}

const THEME = {
	fontFamily: 'Inter, sans-serif',
	fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
	borderRadius: '8px',
	primary: '#16A34A',
	headerBg: '#15803D',
	headerText: '#FFFFFF',
	tabSelected: '#16A34A',
	buttonBackground: '#16A34A',
	buttonTextColor: '#FFFFFF',
	cancelButtonBg: '#F0FDF4',
	background: '#F0FDF4',
	surface: '#FFFFFF',
	inputBackground: '#FFFFFF',
	inputBorder: '#86EFAC',
	border: '#BBF7D0',
	text: '#14532D',
	subText: '#4B7A5E',
	textLight: '#6B9E7E',
	textSecondary: '#166534',
	labelColor: '#15803D',
	success: '#16A34A',
	error: '#DC2626',
	muted: '#6B7280',
	link: '#16A34A',
}

/* ── User Details Form Modal ───────────────────────────────────────── */
function UserFormModal({ onStart, onCancel }) {
	const [refId, setRefId] = useState('user7779')
	const [pan, setPan] = useState('NUVPS4136M')
	const [dob, setDob] = useState('1960-08-08')
	const [gender, setGender] = useState('')

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!gender) return

		const user = {
			id: refId,
			userReferenceId: refId,
			name: 'John',
			dob,
			gender,
			panNumber: pan,
			address: '872/1, 24th Main, 10th Cross',
			area: 'Hanuma Nagar',
			city: 'Bengaluru',
			state: 'Karnataka',
			country: 'India',
			pinCode: '411053',
			mobNo: '9123243342',
			email: 'john@example.com',
			accountNo: '98989898878787',
			nameOfBank: 'HDFC Bank',
			ifsc: 'HDFC0000281',
			typeOfAccount: 'Saving A/c',
			maritalStatus: 'Married',
			eventNotifyUrl: 'https://www.google.com',
			startFDAlertMessage: 'Please complete PAN verification in the Pick my work app to continue with FD booking.',
			kycRelation: 'Father',
			kycRelationName: 'John',
			poweredByLogo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE8p5CngyGVkGdQcJiNqWTQs4UUB1iAnirqQ&s',
		}
		onStart(user)
	}

	return (
		<div className="modal-backdrop" onClick={onCancel}>
			<div className="modal-card" onClick={(e) => e.stopPropagation()}>
				<h2 className="modal-title">Enter User Details</h2>
				<p className="modal-subtitle">
					Please enter User Ref ID, PAN, Date of Birth and Gender to initialize the FD SDK
				</p>

				<form onSubmit={handleSubmit}>
					<div className="field-group">
						<input
							className="field-input"
							type="text"
							placeholder="User Ref ID"
							value={refId}
							onChange={(e) => setRefId(e.target.value)}
							required
						/>
					</div>

					<div className="field-group">
						<input
							className="field-input"
							type="text"
							placeholder="PAN Number"
							value={pan}
							onChange={(e) => setPan(e.target.value.toUpperCase())}
							maxLength={10}
							required
						/>
					</div>

					<div className="field-group field-group--date">
						<label className="date-label">DATE OF BIRTH</label>
						<input
							className="field-input field-input--date"
							type="date"
							value={dob}
							onChange={(e) => setDob(e.target.value)}
							required
						/>
					</div>

					<div className="gender-row">
						<button
							type="button"
							className={`gender-btn${gender === 'Male' ? ' gender-btn--active' : ''}`}
							onClick={() => setGender('Male')}
						>
							Male
						</button>
						<button
							type="button"
							className={`gender-btn${gender === 'Female' ? ' gender-btn--active' : ''}`}
							onClick={() => setGender('Female')}
						>
							Female
						</button>
					</div>
					{!gender && (
						<p className="gender-hint">Please select a gender</p>
					)}

					<div className="action-row">
						<button type="button" className="btn-cancel" onClick={onCancel}>
							Cancel
						</button>
						<button type="submit" className="btn-start">
							Start SDK
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

/* ── SDK Full Screen ───────────────────────────────────────────────── */
function SDKScreen({ user, onBack }) {
	const frameRef = useRef(null)
	const [loading, setLoading] = useState(true)

	const handleLoad = () => {
		setLoading(false)
		frameRef.current?.contentWindow?.postMessage(
			{ type: 'INIT_SDK', payload: { ...API_CONFIG, user, theme: THEME } },
			FD_SDK_URL
		)
	}

	return (
		<div className="sdk-screen">
			{/* <div className="sdk-topbar">
				<button className="sdk-back" onClick={onBack}>
					← Back
				</button>
				<span className="sdk-topbar-title">FD Web SDK</span>
			</div> */}

			<div className="sdk-body">
				{loading && (
					<div className="sdk-loader">
						<div className="spinner" />
					</div>
				)}
				<iframe
					ref={frameRef}
					src={FD_SDK_URL}
					title="FD Web SDK"
					onLoad={handleLoad}
					allow="camera; microphone"
				/>
			</div>
		</div>
	)
}

/* ── Main App ──────────────────────────────────────────────────────── */
export default function App() {
	const [screen, setScreen] = useState('home')  // 'home' | 'sdk'
	const [showForm, setShowForm] = useState(false)
	const [user, setUser] = useState(null)

	const handleStartSDK = (userDetails) => {
		setUser(userDetails)
		setShowForm(false)
		setScreen('sdk')
	}

	if (screen === 'sdk') {
		return (
			<SDKScreen
				user={user}
				onBack={() => setScreen('home')}
			/>
		)
	}

	return (
		<div className="page">
			<div className="hero">
				<div className="logo-mark">FD</div>
				<h1 className="hero-title">Fixed Deposit SDK</h1>
				<p className="hero-sub">Open a fixed deposit in minutes — powered by Finspring</p>
				<button className="btn-launch" onClick={() => setShowForm(true)}>
					Start SDK
				</button>
			</div>

			{showForm && (
				<UserFormModal
					onStart={handleStartSDK}
					onCancel={() => setShowForm(false)}
				/>
			)}
		</div>
	)
}
