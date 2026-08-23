package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.UpdateCardRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.Priority;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    private CardService cardService;

    private Card existingCard(UUID id) {
        TaskList list = new TaskList();
        list.setId(UUID.randomUUID());

        Card card = new Card();
        card.setId(id);
        card.setList(list);
        card.setTitle("元のタイトル");
        card.setDescription("元の説明");
        card.setPriority(Priority.LOW);
        card.setDueDate(LocalDate.of(2026, 1, 1));
        card.setOrder(0);
        return card;
    }

    @Test
    void updateCard_updatesTitleDescriptionPriorityAndDueDate() {
        cardService = new CardService(cardRepository, taskListRepository);
        UUID id = UUID.randomUUID();
        Card card = existingCard(id);
        when(cardRepository.findById(id)).thenReturn(Optional.of(card));
        when(cardRepository.save(any(Card.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateCardRequest request = new UpdateCardRequest(
                "新しいタイトル", "新しい説明", Priority.HIGH, LocalDate.of(2026, 3, 1));

        CardResponse response = cardService.updateCard(id, request);

        assertThat(response.title()).isEqualTo("新しいタイトル");
        assertThat(response.description()).isEqualTo("新しい説明");
        assertThat(response.priority()).isEqualTo(Priority.HIGH);
        assertThat(response.dueDate()).isEqualTo(LocalDate.of(2026, 3, 1));
    }

    @Test
    void updateCard_throwsBadRequest_whenTitleIsBlank() {
        cardService = new CardService(cardRepository, taskListRepository);
        UUID id = UUID.randomUUID();
        UpdateCardRequest request = new UpdateCardRequest(" ", null, null, null);

        assertThatThrownBy(() -> cardService.updateCard(id, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("title is required");

        verify(cardRepository, never()).findById(any());
    }

    @Test
    void updateCard_throwsNotFound_whenCardDoesNotExist() {
        cardService = new CardService(cardRepository, taskListRepository);
        UUID id = UUID.randomUUID();
        when(cardRepository.findById(id)).thenReturn(Optional.empty());

        UpdateCardRequest request = new UpdateCardRequest("タイトル", null, null, null);

        assertThatThrownBy(() -> cardService.updateCard(id, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Card not found");
    }
}
