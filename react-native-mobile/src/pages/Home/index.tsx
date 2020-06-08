
import React, { useEffect, useState, ChangeEvent } from 'react'
import { Image, ImageBackground, Text, View, StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'

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

const Home = () => {

  const navigation = useNavigation()

  const [ufs, setUfs] = useState<Array<UF>>([])
  const [selectedUf, setSelectedUf] = useState<string>()
  const [cities, setCities] = useState<Array<City>>([])
  const [selectedCity, setSelectedCity] = useState<string>()

  useEffect(() => {
    axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      response.data.sort((a, b) => (a.sigla > b.sigla ? 1 : (a.sigla < b.sigla ? -1 : 0)));
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

  function handleSelectUf(value: string) {
    setSelectedUf(value)
  }

  function handleSelectCity(value: string) {
    setSelectedCity(value)
  }

  function handleNavigation() {
    navigation.navigate('Points', {uf: selectedUf, city: selectedCity})
  }
  
  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')}
      style={styles.container}>
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')}/>
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
      </View>

      <View style={styles.footer}>

        <RNPickerSelect
          style={styles}
          itemKey="uf"
          onValueChange={(value) => handleSelectUf(value)}
          placeholder={{label: 'Selecione um estado'}}
          items={ufs.map(uf => ({
            label: uf.sigla,
            value: uf.sigla
          }))}
        />
        <RNPickerSelect
          style={styles}
          itemKey="city"
          onValueChange={(value) => handleSelectCity(value)}
          placeholder={{label: 'Selecione uma cidade'}}
          items={cities.map(city => ({
            label: city.nome,
            value: city.nome
          }))}
        />

        <RectButton
          enabled={selectedUf != null && selectedCity != null}
          style={styles.button}
          onPress={handleNavigation}>
            <View style={styles.buttonIcon}>
              <Icon name="arrow-right" color="#ffff" size={24}/>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#f0f0f5'
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  inputIOS: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});