
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'typing-correct': 'hsl(142, 76%, 36%)',
				'typing-incorrect': 'hsl(0, 84%, 60%)',
				'typing-current': 'hsl(217, 91%, 60%)',
				'neon-blue': 'hsl(216, 100%, 70%)',
				'neon-purple': 'hsl(280, 100%, 70%)',
				'neon-green': 'hsl(120, 100%, 70%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'jiggle': {
					'0%, 100%': { transform: 'rotate(0deg) scale(1)' },
					'25%': { transform: 'rotate(-2deg) scale(1.02)' },
					'50%': { transform: 'rotate(2deg) scale(0.98)' },
					'75%': { transform: 'rotate(-1deg) scale(1.01)' }
				},
				'rubber-band': {
					'0%': { transform: 'scale(1)' },
					'30%': { transform: 'scale(1.25, 0.75)' },
					'40%': { transform: 'scale(0.75, 1.25)' },
					'50%': { transform: 'scale(1.15, 0.85)' },
					'65%': { transform: 'scale(0.95, 1.05)' },
					'75%': { transform: 'scale(1.05, 0.95)' },
					'100%': { transform: 'scale(1)' }
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgb(59, 130, 246, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgb(59, 130, 246, 0.8), 0 0 30px rgb(59, 130, 246, 0.6)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-10px) rotate(1deg)'
					},
					'66%': {
						transform: 'translateY(-5px) rotate(-1deg)'
					}
				},
				'glow': {
					'0%, 100%': {
						textShadow: '0 0 5px currentColor, 0 0 10px currentColor'
					},
					'50%': {
						textShadow: '0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor'
					}
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'jiggle': 'jiggle 0.6s ease-in-out',
				'rubber-band': 'rubber-band 1s ease-in-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'wiggle': 'wiggle 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
