package com.grupo5.ta_share.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private MessageSource messageSource;

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        lenient().when(messageSource.getMessage(eq("error.business.title"), any(), any(Locale.class)))
                .thenReturn("Erro de Regra de Negócio");
        lenient().when(messageSource.getMessage(eq("error.validation.title"), any(), any(Locale.class)))
                .thenReturn("Erro de Validação");
        lenient().when(messageSource.getMessage(eq("error.internal.title"), any(), any(Locale.class)))
                .thenReturn("Erro Interno do Servidor");
        lenient().when(messageSource.getMessage(eq("error.default.message"), any(), any(Locale.class)))
                .thenReturn("Ocorreu um erro inesperado.");
    }

    @Test
    @DisplayName("handleResponseStatus - Deve retornar status e mensagem informada na ResponseStatusException")
    void deveTratarResponseStatusExceptionComReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso não encontrado");

        var response = exceptionHandler.handleResponseStatus(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("Erro de Regra de Negócio", response.getBody().get("error"));
        assertEquals("Recurso não encontrado", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    @DisplayName("handleResponseStatus - Deve usar mensagem padrão quando reason da exceção for nulo")
    void deveTratarResponseStatusExceptionSemReason() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.CONFLICT);

        var response = exceptionHandler.handleResponseStatus(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().get("status"));
        assertEquals("Erro de Regra de Negócio", response.getBody().get("error"));
        assertEquals("Ocorreu um erro inesperado.", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    @DisplayName("handleValidation - Deve retornar 400 Bad Request com mapa de campos inválidos")
    @SuppressWarnings("unchecked")
    void deveTratarMethodArgumentNotValidException() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "usuarioRequestDTO");
        bindingResult.addError(new FieldError("usuarioRequestDTO", "nome", "Nome é obrigatório"));
        bindingResult.addError(new FieldError("usuarioRequestDTO", "email", "E-mail inválido"));

        Method method = GlobalExceptionHandler.class.getMethod("handleValidation", MethodArgumentNotValidException.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        var response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Erro de Validação", response.getBody().get("error"));
        assertNotNull(response.getBody().get("timestamp"));

        Map<String, String> campos = (Map<String, String>) response.getBody().get("fields");
        assertNotNull(campos);
        assertEquals(2, campos.size());
        assertEquals("Nome é obrigatório", campos.get("nome"));
        assertEquals("E-mail inválido", campos.get("email"));
    }

    @Test
    @DisplayName("handleValidation - Deve retornar mapa vazio em 'fields' quando não houver FieldErrors")
    @SuppressWarnings("unchecked")
    void deveTratarMethodArgumentNotValidExceptionSemFieldErrors() throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "usuarioRequestDTO");
        Method method = GlobalExceptionHandler.class.getMethod("handleValidation", MethodArgumentNotValidException.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        var response = exceptionHandler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        Map<String, String> campos = (Map<String, String>) response.getBody().get("fields");
        assertTrue(campos.isEmpty());
    }

    @Test
    @DisplayName("handleGeneric - Deve retornar 500 Internal Server Error com mensagem da exceção")
    void deveTratarExceptionGenericaComMensagem() {
        Exception ex = new RuntimeException("Falha de conexão com o banco");

        var response = exceptionHandler.handleGeneric(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("Erro Interno do Servidor", response.getBody().get("error"));
        assertEquals("Falha de conexão com o banco", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }

    @Test
    @DisplayName("handleGeneric - Deve usar mensagem padrão quando getMessage() da exceção for nulo")
    void deveTratarExceptionGenericaSemMensagem() {
        Exception ex = new NullPointerException();

        var response = exceptionHandler.handleGeneric(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().get("status"));
        assertEquals("Erro Interno do Servidor", response.getBody().get("error"));
        assertEquals("Ocorreu um erro inesperado.", response.getBody().get("message"));
        assertNotNull(response.getBody().get("timestamp"));
    }
}