import { forwardRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  FileText,
  GraduationCap,
  LockKeyhole,
  Mail,
  Phone,
  Send,
  Upload,
  UserRound
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import Button from '../components/ui/Button.jsx'
import { destinationForRole, loginUser } from '../lib/login.js'
import api from '../services/api.js'
import { getCurrentRole, getHomePath, isAuthenticated } from '../lib/authRole.js'

const requestSchema = z.object({
  nom: z.string().min(2, 'Nom obligatoire'),
  cin: z.string().min(5, 'CIN obligatoire'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(8, 'Telephone obligatoire'),
  filiere: z.string().min(2, 'Filiere obligatoire'),
  genre: z.string().min(1, 'Genre obligatoire'),
  certificat: z.any()
    .refine((files) => files?.length > 0, 'Certificat de residence obligatoire')
    .refine((files) => {
      const file = files?.[0]
      return file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    }, 'Certificat PDF, JPG ou PNG seulement')
    .refine((files) => (files?.[0]?.size || 0) <= 4 * 1024 * 1024, 'Certificat max 4 Mo')
})

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court')
})

const Field = forwardRef(function Field({ icon: Icon, label, error, as = 'input', children, className = '', ...props }, ref) {
  const Component = as
  const isTextarea = as === 'textarea'

  return (
    <label className={`landing-field ${className}`}>
      <span className="landing-label">{label}</span>
      <span className="relative block">
        <Icon className={`pointer-events-none absolute left-4 h-4 w-4 text-slate-400 ${isTextarea ? 'top-4' : 'top-1/2 -translate-y-1/2'}`} />
        <Component ref={ref} className={`landing-input pl-11 ${isTextarea ? 'landing-textarea' : ''}`} {...props}>
          {children}
        </Component>
      </span>
      {error && <span className="mt-1 block text-xs font-semibold text-danger">{error.message}</span>}
    </label>
  )
})

function AuthPanel() {
  const [activeTab, setActiveTab] = useState('request')
  const [certificatName, setCertificatName] = useState('')
  const navigate = useNavigate()
  const isRequest = activeTab === 'request'
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nom: '',
      cin: '',
      email: '',
      telephone: '',
      filiere: '',
      genre: '',
      annee: '1ere annee',
      certificat: null,
      password: ''
    }
  })

  const changeTab = (tab) => {
    setActiveTab(tab)
    setCertificatName('')
    reset()
  }

  const certificatField = register('certificat')

  const submit = async (values) => {
    const parsed = (isRequest ? requestSchema : loginSchema).safeParse(values)

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setError(issue.path[0], { message: issue.message }))
      toast.error('Veuillez verifier les champs du formulaire.')
      return
    }

    if (isRequest) {
      try {
        const formData = new FormData()
        formData.append('nom', values.nom)
        formData.append('cin', values.cin)
        formData.append('email', values.email)
        formData.append('telephone', values.telephone)
        formData.append('filiere', values.filiere)
        formData.append('genre', values.genre)
        if (values.certificat?.[0]) formData.append('certificat_residence', values.certificat[0])

        await api.post('/demandes', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Demande envoyee. Elle est visible dans la page Demandes.')
        setCertificatName('')
        reset()
      } catch (error) {
        toast.error(error.response?.data?.message || "La demande n'a pas pu etre envoyee.")
      }
      return
    }

    try {
      const session = await loginUser(values)
      toast.success('Connexion reussie.')
      navigate(destinationForRole(session.role), { replace: true })
    } catch {
      toast.error('Identifiants incorrects.')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-tabs">
          <button type="button" className={activeTab === 'login' ? 'active' : ''} onClick={() => changeTab('login')}>
            Connexion
          </button>
          <button type="button" className={activeTab === 'request' ? 'active' : ''} onClick={() => changeTab('request')}>
            Faire une demande
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="auth-heading">
              <h1>{isRequest ? 'Faire une demande' : 'Connexion'}</h1>
              <p>
                {isRequest
                  ? "Remplissez ce formulaire pour votre demande d'internat"
                  : 'Connectez-vous a votre espace de gestion'}
              </p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="landing-form">
              {isRequest ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field icon={UserRound} label="Nom complet" placeholder="Votre nom" {...register('nom')} error={errors.nom} />
                    <Field icon={FileText} label="CIN" placeholder="A8123456" {...register('cin')} error={errors.cin} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field icon={Mail} label="Email" type="email" placeholder="votre@email.com" {...register('email')} error={errors.email} />
                    <Field icon={Phone} label="Telephone" placeholder="06XXXXXXXX" {...register('telephone')} error={errors.telephone} />
                  </div>
                  <Field icon={GraduationCap} label="Filiere" placeholder="Developpement Digital" {...register('filiere')} error={errors.filiere} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field icon={UserRound} label="Genre" as="select" {...register('genre')} error={errors.genre}>
                      <option value="" disabled>Selectionner le genre</option>
                      <option value="Fille">Fille</option>
                      <option value="Garcon">Garcon</option>
                    </Field>
                    <Field icon={CalendarDays} label="Annee" as="select" {...register('annee')}>
                      <option>1ere annee</option>
                      <option>2eme annee</option>
                    </Field>
                  </div>
                  <label className="landing-field">
                    <span className="landing-label">Certificat de residence</span>
                    <span className="landing-file">
                      <FileText className="landing-file-icon" />
                      <span className={certificatName ? 'landing-file-name' : 'landing-file-placeholder'}>
                        {certificatName || 'Ajouter le certificat de residence'}
                      </span>
                      <span className="landing-file-action">
                        <Upload className="h-3.5 w-3.5" />
                        Choisir
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="landing-file-input"
                        {...certificatField}
                        onChange={(event) => {
                          certificatField.onChange(event)
                          setCertificatName(event.target.files?.[0]?.name || '')
                        }}
                      />
                    </span>
                    {errors.certificat && <span className="mt-1 block text-xs font-semibold text-danger">{errors.certificat.message}</span>}
                  </label>
                  <Button type="submit" className="landing-submit">
                    <Send className="h-4 w-4" />
                    Soumettre la demande
                  </Button>
                </>
              ) : (
                <>
                  <Field icon={Mail} label="Email" type="email" placeholder="admin@cmc.test" {...register('email')} error={errors.email} />
                  <Field icon={LockKeyhole} label="Mot de passe" type="password" placeholder="Mot de passe" {...register('password')} error={errors.password} />
                  <Button type="submit" className="landing-submit">
                    <LockKeyhole className="h-4 w-4" />
                    Se connecter
                  </Button>
                </>
              )}
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Home() {
  if (isAuthenticated() && getCurrentRole()) {
    return <Navigate to={getHomePath()} replace />
  }

  return (
    <main className="landing-page">
      <header className="landing-header">
        <img src="/assets/easyinternat-logo-transparent.png" alt="EasyInternat" className="landing-logo" />
      </header>

      <section className="landing-content">
        <div aria-hidden="true" />
        <AuthPanel />
      </section>
    </main>
  )
}
