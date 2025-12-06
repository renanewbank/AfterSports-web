import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  )

export const formatDateTime = (iso: string) =>
  dayjs(iso).format('DD/MM/YYYY HH:mm')

export const formatInstantToLocal = (iso: string) =>
  dayjs(iso).utc().local().format('DD/MM/YYYY HH:mm')

export const toInputDateTime = (iso: string) =>
  dayjs(iso).format('YYYY-MM-DDTHH:mm')
