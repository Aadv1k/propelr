
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Link,
  Button,
  Divider,
  Box,
  Flex,
  StackDivider,
  Text,
  Stack,
  Image,
} from '@chakra-ui/react';
import { FormControl, FormLabel, FormErrorMessage, Input, FormHelperText } from '@chakra-ui/react';
import React from 'react';

import imgMonkey2 from '../assets/dalle-monkey-2.png';
import { useToast } from '@chakra-ui/react';

const sampleRegisterData = JSON.stringify({
  error: {
    code: 'user-already-exists',
    message: 'Registration Failed',
    details: 'The user with the provided email already exists in the system.',
  },
  status: 400,
});

export default function Register() {
  const [password, setPassword] = React.useState('');
  const [repPassword, setRepPassword] = React.useState('');
  const [email, setEmail] = React.useState('');

  const [isNotSamePassword, setNotSamePassword] = React.useState(false);
  const [isBadPassword, setBadPassword] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    setNotSamePassword(password !== repPassword);
    setBadPassword(password.length < 8 && password !== '');
    setError(isNotSamePassword || isBadPassword);
  });

  return (
    <Card maxW={600} w="90%" mx="auto" my={50}>
      <CardHeader>
        <Heading size="xl" fontFamily="heading" color="blue.200" fontWeight={800} textAlign="left">
          Sign Up
        </Heading>
      </CardHeader>

      <CardBody>
        <Flex justifyContent="center" flexDirection="column" w="full" my={2} gap={2}>
          <Button
            leftIcon={<i style={{ fontSize: '1.2rem' }} className="bi bi-microsoft"></i>}
            variant="solid"
            w="full"
          >
            Sign up with microsoft
          </Button>

          <Button
            leftIcon={<i style={{ fontSize: '1.2rem' }} className="bi bi-google"></i>}
            variant="solid"
            w="full"
          >
            Sign up with google
          </Button>
        </Flex>

        <Box w="full" display="flex" alignItems="center" justifyContent="center" gap={2} my={6}>
          <Box w="50%" h="1px" bg="gray.300" rounded="full"></Box>
          <Text fontWeight="400" fontSize="sm" color="gray.500">
            OR
          </Text>
          <Box w="50%" h="1px" bg="gray.300" rounded="full"></Box>
        </Box>

        <Stack
          as="form"
          my={2}
          gap={1}
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.target as HTMLFormElement);
            const formProps = Object.fromEntries(form);

            setLoading(true);
            setTimeout(() => {
              const data = JSON.parse(sampleRegisterData);

              if (data.status !== 200) {
                toast({
                  title: data.error.message,
                  description: data.error.details,
                  position: 'top-right',
                  status: 'error',
                  duration: 2000,
                  isClosable: true,
                });
              } else {
                console.log('OK');
              }
              setLoading(false);
            }, 1000);
          }}
        >
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" placeholder="Email" required />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isBadPassword && (
              <Text textAlign="left" color="red.600">
                Need a stronger password
              </Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder="Confirm password"
              onChange={(e) => setRepPassword(e.target.value)}
              required
            />
            {isNotSamePassword && (
              <Text textAlign="left" color="red.600">
                Passwords don't match
              </Text>
            )}
          </FormControl>

          <Button
            variant="solid"
            type="submit"
            isDisabled={isError}
            isLoading={isLoading}
            w={{ base: 'full' }}
          >
            Submit
          </Button>

        </Stack>
        <Text mt={3} color="gray.600">Already a registered user? <RouterLink to="/login"><Link color="blue.100" textDecoration="underline">Login</Link></RouterLink ></Text>
      </CardBody>
    </Card>
  );
}
