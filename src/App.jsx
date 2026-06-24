import { useCallback, useEffect, useRef, useState } from 'react'
import './index.css'

const FD_SDK_URL = 'https://fd-web-nine.vercel.app'

const API_CONFIG = {
	// apiBaseUrl: 'https://api.finspring.ai/dev/finspring/api/v1/',
	// apiKey: 'f58f4aa316cd7462d679910eba52a3b4',
	// encryptionKey: '60913a3b628a29ac9fdd2147e69d013135ce8be5b26d2ee5ec5e905838fcfa78',
	apiBaseUrl: 'https://api.finspring.ai/uat/pmw/api/v1/',
	apiKey: '17218f8100d1def10ee374ee0f63172c',
	encryptionKey: 'c6bbf374f4ff8091b6274b7346f1061f33621e2c1465a9554fb3ebc99a5fc386',
	isForMobile: false,
}

const THEME = {
	fontFamily: 'Inter, sans-serif',
	fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
	borderRadius: '8px',
	primary: '#1E40AF',
	headerBg: '#1E3A8A',
	headerText: '#FFFFFF',

	tabSelected: '#2563EB',

	buttonBackground: '#2563EB',
	buttonTextColor: '#FFFFFF',
	cancelButtonBg: '#EFF6FF',

	background: '#F8FAFC',
	surface: '#FFFFFF',

	inputBackground: '#FFFFFF',
	inputBorder: '#CBD5E1',

	border: '#E2E8F0',

	text: '#0F172A',
	subText: '#475569',
	textLight: '#64748B',
	textSecondary: '#334155',

	labelColor: '#1E3A8A',

	success: '#16A34A',
	error: '#DC2626',
	pending: '#F59E0B',

	muted: '#94A3B8',
	link: '#2563EB',

	accent: '#F59E0B'
}

/* ── User Details Form Modal ───────────────────────────────────────── */
function UserFormModal({ onStart, onCancel }) {
	const [refId, setRefId] = useState('')
	const [pan, setPan] = useState('')
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
			poweredByLogo: 'https://images.scalebranding.com/cool-a-logo-50afaa14-6473-4b28-b9c5-e08d50d8e7da.jpg',
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
	const pendingUser = useRef(user)
	pendingUser.current = user

	const sendInit = useCallback(() => {
		frameRef.current?.contentWindow?.postMessage(
			{ type: 'INIT_SDK', payload: { ...API_CONFIG, user: pendingUser.current, theme: THEME } },
			FD_SDK_URL
		)
	}, [])

	useEffect(() => {
		function onMessage(e) {
			if (e.origin !== FD_SDK_URL) return
			if (e.data?.type === 'FD_SDK_READY') sendInit()
			if (e.data?.type === 'FD_EXIT') onBack()
		}
		window.addEventListener('message', onMessage)
		return () => window.removeEventListener('message', onMessage)
	}, [sendInit, onBack])

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
					onLoad={() => { setLoading(false); sendInit(); }}
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

	if (screen === 'sdk' && user) {
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
