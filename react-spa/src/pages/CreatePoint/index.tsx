import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import React, { ChangeEvent, useEffect, useState, FormEvent } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, Marker, TileLayer } from 'react-leaflet'
import { Link, useHistory } from 'react-router-dom'
import logo from '../../assets/images/logo.svg'
import api from '../../services/api'
import './styles.css'
import Dropzone from '../../components/Dropzone'

interface Item {
  id: number;
  image_url: string;
  title: string;
}

export interface Regiao {
  id: number;
  sigla: string;
  nome: string;
}

export interface UF {
  id: number;
  sigla: string;
  nome: string;
  regiao: Regiao;
}

export interface Mesorregiao {
  id: number;
  nome: string;
  UF: UF;
}

export interface Microrregiao {
  id: number;
  nome: string;
  mesorregiao: Mesorregiao;
}

export interface City {
  id: number;
  nome: string;
  microrregiao: Microrregiao;
}

const CreatePoint: React.FC = () => {

  const [actualPosition, setActualPosition] = useState<[number, number]>([-23.6869153, -46.6310285])
  
  const [items, setItems] = useState<Array<Item>>([])
  const [ufs, setUfs] = useState<Array<UF>>([])
  const [selectedUf, setSelectedUf] = useState<string>()
  const [cities, setCities] = useState<Array<City>>([])
  const [selectedCity, setSelectedCity] = useState<string>()
  const [selectedItems, setSelectedItems] = useState<Array<number>>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([-23.6869153, -46.6310285])
  const [formData, setFormData] = useState({
    name: null,
    email: null,
    whatsapp: null
  })

  const [file, setFile] = useState<File>()
  const history = useHistory()

  useEffect(() => {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(position => {
        setActualPosition([position.coords.latitude, position.coords.longitude])
        setSelectedPosition([position.coords.latitude, position.coords.longitude])
      })
  })

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, [])

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      setUfs(response.data);
    })
  }, [])

  useEffect(() => {
    if (selectedUf != null) {
      axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
        setCities(response.data);
      })
    }
  }, [selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleClickMap(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData({...formData, [event.target.name]: event.target.value})
  }

  function handleItemSelect(id: number) {
    const index = selectedItems.findIndex(item => item === id);
    if (index > -1)
      setSelectedItems(selectedItems.filter(item => item !== id))
    else
      setSelectedItems([...selectedItems, id])
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!file)
      return

    const [latitude, longitude] = selectedPosition;
    const { name, email, whatsapp } = formData;
    const city = selectedCity;
    const uf = selectedUf;
    const items = selectedItems;

    const data = new FormData()
    data.append('name', String(name))
    data.append('email', String(email))
    data.append('whatsapp', String(whatsapp))
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('city', String(city))
    data.append('uf', String(uf))
    data.append('items', items.join(','))
    data.append('image', file)
    
    api.post('points', data).then(response => {
      alert('Ponto de coleta, criado com sucesso');
      history.push('/')
    });
  }

  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setFile}/>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={actualPosition} zoom={15} onClick={handleClickMap}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}></Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}>
                  <option value={undefined}>Selecione uma UF</option>
                  {ufs.map(uf => (
                    <option 
                      key={uf.id}
                      value={uf.sigla}>
                      {uf.sigla}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}>
                  <option value={undefined}>Selecione uma Cidade</option>
                  {cities.map(city => (
                    <option 
                      key={city.id}
                      value={city.nome}>
                        {city.nome}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id}
                onClick={() => handleItemSelect(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
            
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint